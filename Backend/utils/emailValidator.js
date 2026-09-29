// List of known disposable, temporary, and fake email domain providers
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temporary/disposable email services
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "getairmail.com",
  "mohmal.com",
  "crazymailing.com",
  "maildrop.cc",
  "generator.email",
  "inboxbear.com",
  "burnermail.io",
  "fakemailgenerator.com",
  "mytemp.email",
  "emailondeck.com",
  "nada.ltd",
  "getnada.com",
  "tempm.com",
  "throwawaymail.com",
  "fake.com",
  "test.com",
  "example.com",
  "demo.com",
  "dummy.com",
  "temporaryemail.com",
  "discard.email",
  "tempail.com",
  "fakeinbox.com",
  "trash-mail.com",
  "spambog.com",
  "maildrop.com",
  "getnada.edu",
  "disposablemail.com",
  "dayrep.com",
  "teleworm.us",
  "superrito.com",
  "rhyta.com",
  "jourrapide.com",
  "gustr.com",
  "fleckens.hu",
  "einrot.com",
  "cuvox.de",
  "armyspy.com"
]);

/**
 * Validates an email address.
 * @param {string} email - The email to check
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, message: "Email address is required" };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, message: "Please provide a valid email format" };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return { isValid: false, message: "Invalid email format" };
  }

  const [localPart, domain] = parts;

  // Block obviously fake dummy prefixes
  const dummyPrefixes = ["test", "dummy", "fake", "temp", "admin", "null", "undefined", "user", "asdf"];
  if (dummyPrefixes.includes(localPart) && (domain === "test.com" || domain === "demo.com" || domain === "gmail.com")) {
    // Only flag if generic test@test or test@gmail
    if (localPart === "test" || localPart === "dummy" || localPart === "fake") {
      return { isValid: false, message: "Generic dummy email addresses are not allowed. Please enter your real email." };
    }
  }

  // Check disposable email domain
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: "Disposable and temporary email domains are not allowed. Please use a genuine email provider (e.g. Gmail, Yahoo, Outlook)."
    };
  }

  return { isValid: true };
};
