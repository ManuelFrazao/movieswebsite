"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const q = (sql) => queryInterface.sequelize.query(sql, { transaction: t });

      // --- Enum types ---
      await q(`CREATE TYPE "enum_Casts_roleType" AS ENUM ('main','supporting','guest');`);
      await q(`CREATE TYPE "enum_Entries_status" AS ENUM ('not aired','running','ended');`);
      await q(`CREATE TYPE "enum_Entries_type" AS ENUM ('movie','series');`);
      await q(`CREATE TYPE "enum_Favorites_targetType" AS ENUM ('entry','episode','character','actor');`);
      await q(`CREATE TYPE "enum_Images_targetType" AS ENUM ('entry','episode');`);
      await q(`CREATE TYPE "enum_Likes_type" AS ENUM ('entry','episode','review','video');`);
      await q(`CREATE TYPE "enum_Reviews_type" AS ENUM ('entry','episode');`);
      await q(`CREATE TYPE "enum_Users_role" AS ENUM ('user','admin');`);
      await q(`CREATE TYPE "enum_Videos_targetType" AS ENUM ('entry','episode');`);
      await q(`CREATE TYPE "enum_Votes_type" AS ENUM ('entry','episode');`);
      await q(`CREATE TYPE "enum_Watchlists_targetType" AS ENUM ('entry','episode','character','actor');`);

      // --- Tier 1: no foreign keys ---
      await q(`
        CREATE TABLE "Users" (
          id uuid NOT NULL PRIMARY KEY,
          username varchar(255) NOT NULL UNIQUE,
          email varchar(255) NOT NULL UNIQUE,
          password varchar(255) NOT NULL,
          role "enum_Users_role" DEFAULT 'user',
          avatar varchar(255),
          bio text,
          "isActive" boolean DEFAULT true,
          "lastLogin" timestamptz,
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL
        );
      `);

      await q(`
        CREATE TABLE "Actors" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          name varchar(255) NOT NULL,
          slug varchar(255) NOT NULL UNIQUE,
          "profileImage" varchar(255),
          bio text,
          "birthDate" timestamptz,
          "deathDate" timestamptz,
          birthplace varchar(255),
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Characters" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          name varchar(255) NOT NULL,
          slug varchar(255) NOT NULL UNIQUE,
          image varchar(255),
          description text,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Entries" (
          id uuid NOT NULL PRIMARY KEY,
          title varchar(255) NOT NULL,
          slug varchar(255) NOT NULL UNIQUE,
          type "enum_Entries_type" NOT NULL,
          status "enum_Entries_status" DEFAULT 'not aired',
          description text,
          "releaseDate" timestamptz,
          "endingYear" integer,
          "coverImage" varchar(255),
          "topRank" integer DEFAULT 0,
          "ageRating" varchar(255),
          genres json DEFAULT '[]',
          creators json DEFAULT '[]',
          writers json DEFAULT '[]',
          directors json DEFAULT '[]',
          summary text,
          storyline text,
          "storylineAuthor" json DEFAULT '[]',
          "plotKeywords" json DEFAULT '[]',
          tagline varchar(255),
          "countriesOrigin" json DEFAULT '[]',
          language json DEFAULT '[]',
          alsoknownas json DEFAULT '[]',
          "totalVotes" integer DEFAULT 0,
          duration integer,
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL
        );
      `);

      await q(`
        CREATE TABLE "Images" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          url varchar(255) NOT NULL,
          caption varchar(255),
          "targetType" "enum_Images_targetType" NOT NULL,
          "targetId" varchar(255) NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Videos" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          url varchar(255) NOT NULL,
          title varchar(255),
          "isTrailer" boolean DEFAULT false,
          "targetType" "enum_Videos_targetType" NOT NULL,
          "targetId" varchar(255) NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      // --- Tier 2: depend only on Tier 1 ---
      await q(`
        CREATE TABLE "CharacterAliases" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          "characterId" uuid NOT NULL REFERENCES "Characters"(id) ON DELETE CASCADE,
          name varchar(255) NOT NULL,
          "startSeason" integer,
          "endSeason" integer,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Comments" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          content text NOT NULL,
          "videoId" uuid REFERENCES "Videos"(id) ON DELETE CASCADE,
          "userId" uuid REFERENCES "Users"(id),
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Favorites" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          "userId" uuid NOT NULL REFERENCES "Users"(id),
          "targetId" uuid NOT NULL,
          "targetType" "enum_Favorites_targetType" NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Watchlists" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          "userId" uuid NOT NULL REFERENCES "Users"(id),
          "targetId" uuid NOT NULL,
          "targetType" "enum_Watchlists_targetType" NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      await q(`
        CREATE TABLE "Seasons" (
          id uuid NOT NULL PRIMARY KEY,
          "seasonNumber" integer NOT NULL,
          title varchar(255),
          description text,
          "releaseDate" timestamptz,
          "coverImage" varchar(255),
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL,
          "entryId" uuid REFERENCES "Entries"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);

      // --- Tier 3: depends on Entries + Seasons ---
      await q(`
        CREATE TABLE "Episodes" (
          id uuid NOT NULL PRIMARY KEY,
          number integer NOT NULL,
          title varchar(255) NOT NULL,
          description text,
          "airDate" timestamptz,
          thumbnail varchar(255),
          duration integer,
          "isFinal" boolean DEFAULT false,
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL,
          "seasonId" uuid REFERENCES "Seasons"(id) ON DELETE CASCADE ON UPDATE CASCADE,
          "entryId" uuid REFERENCES "Entries"(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
      `);

      // --- Tier 4: depend on Episodes ---
      await q(`
        CREATE TABLE "Reviews" (
          id uuid NOT NULL PRIMARY KEY,
          content text NOT NULL,
          rating double precision NOT NULL,
          type "enum_Reviews_type" NOT NULL,
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL,
          "userId" uuid REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
          "entryId" uuid REFERENCES "Entries"(id) ON DELETE SET NULL ON UPDATE CASCADE,
          "episodeId" uuid REFERENCES "Episodes"(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
      `);

      await q(`
        CREATE TABLE "Votes" (
          id uuid NOT NULL PRIMARY KEY,
          value integer NOT NULL,
          type "enum_Votes_type" NOT NULL,
          "createdAt" timestamptz NOT NULL,
          "updatedAt" timestamptz NOT NULL,
          "userId" uuid REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
          "entryId" uuid REFERENCES "Entries"(id) ON DELETE SET NULL ON UPDATE CASCADE,
          "episodeId" uuid REFERENCES "Episodes"(id) ON DELETE SET NULL ON UPDATE CASCADE
        );
      `);

      await q(`
        CREATE TABLE "Casts" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          "actorId" uuid NOT NULL REFERENCES "Actors"(id),
          "characterId" uuid NOT NULL REFERENCES "Characters"(id),
          "entryId" uuid NOT NULL REFERENCES "Entries"(id),
          "episodeId" uuid REFERENCES "Episodes"(id),
          "roleType" "enum_Casts_roleType" DEFAULT 'supporting',
          "order" integer DEFAULT 0,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);

      // --- Tier 5: depends on Reviews ---
      await q(`
        CREATE TABLE "Likes" (
          id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
          type "enum_Likes_type" NOT NULL,
          value integer NOT NULL DEFAULT 1,
          "userId" uuid REFERENCES "Users"(id),
          "entryId" uuid REFERENCES "Entries"(id),
          "episodeId" uuid REFERENCES "Episodes"(id),
          "reviewId" uuid REFERENCES "Reviews"(id),
          "videoId" uuid REFERENCES "Videos"(id),
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const q = (sql) => queryInterface.sequelize.query(sql, { transaction: t });

      // Drop in reverse dependency order so no FK is left dangling mid-drop.
      await q(`DROP TABLE IF EXISTS "Likes";`);
      await q(`DROP TABLE IF EXISTS "Casts";`);
      await q(`DROP TABLE IF EXISTS "Votes";`);
      await q(`DROP TABLE IF EXISTS "Reviews";`);
      await q(`DROP TABLE IF EXISTS "Episodes";`);
      await q(`DROP TABLE IF EXISTS "Seasons";`);
      await q(`DROP TABLE IF EXISTS "Watchlists";`);
      await q(`DROP TABLE IF EXISTS "Favorites";`);
      await q(`DROP TABLE IF EXISTS "Comments";`);
      await q(`DROP TABLE IF EXISTS "CharacterAliases";`);
      await q(`DROP TABLE IF EXISTS "Videos";`);
      await q(`DROP TABLE IF EXISTS "Images";`);
      await q(`DROP TABLE IF EXISTS "Entries";`);
      await q(`DROP TABLE IF EXISTS "Characters";`);
      await q(`DROP TABLE IF EXISTS "Actors";`);
      await q(`DROP TABLE IF EXISTS "Users";`);

      await q(`DROP TYPE IF EXISTS "enum_Watchlists_targetType";`);
      await q(`DROP TYPE IF EXISTS "enum_Votes_type";`);
      await q(`DROP TYPE IF EXISTS "enum_Videos_targetType";`);
      await q(`DROP TYPE IF EXISTS "enum_Users_role";`);
      await q(`DROP TYPE IF EXISTS "enum_Reviews_type";`);
      await q(`DROP TYPE IF EXISTS "enum_Likes_type";`);
      await q(`DROP TYPE IF EXISTS "enum_Images_targetType";`);
      await q(`DROP TYPE IF EXISTS "enum_Favorites_targetType";`);
      await q(`DROP TYPE IF EXISTS "enum_Entries_type";`);
      await q(`DROP TYPE IF EXISTS "enum_Entries_status";`);
      await q(`DROP TYPE IF EXISTS "enum_Casts_roleType";`);
    });
  },
};