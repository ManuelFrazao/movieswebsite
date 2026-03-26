export const SPAM_USER_ID = "8e5d72e6-b3b1-4c36-9201-58003407deb8";

export const isSpamUser = (req) => {
  return req.user?.id === SPAM_USER_ID;
};