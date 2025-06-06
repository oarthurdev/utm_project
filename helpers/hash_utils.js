/**
 * Hash Utilities for Facebook Offline Conversions API
 * Provides secure SHA256 hashing functions for personal data
 * as required by Facebook's data protection standards
 */

const crypto = require('crypto');

/**
 * Hash a single value using SHA256
 * Normalizes the input by trimming whitespace and converting to lowercase
 * @param {string} value - The value to hash
 * @returns {string} - The SHA256 hash in hexadecimal format
 */
function hashSha256(value) {
  if (!value || value === null || value === undefined) {
    return '';
  }
  
  try {
    // Convert to string, trim whitespace, and convert to lowercase for consistency
    const normalized = value.toString().trim().toLowerCase();
    
    // Return empty string if the normalized value is empty
    if (normalized === '') {
      return '';
    }
    
    // Create SHA256 hash
    return crypto.createHash('sha256').update(normalized).digest('hex');
  } catch (error) {
    console.error(`Error hashing value: ${error.message}`);
    return '';
  }
}

/**
 * Hash an email address according to Facebook standards
 * @param {string} email - The email address to hash
 * @returns {string} - The SHA256 hash of the normalized email
 */
function hashEmail(email) {
  if (!email) return '';
  
  try {
    // Remove any whitespace and convert to lowercase
    const normalizedEmail = email.toString().trim().toLowerCase();
    
    // Basic email validation
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      console.warn(`Invalid email format: ${email}`);
      return '';
    }
    
    return hashSha256(normalizedEmail);
  } catch (error) {
    console.error(`Error hashing email: ${error.message}`);
    return '';
  }
}

/**
 * Hash a phone number according to Facebook standards
 * Removes all non-digit characters before hashing
 * @param {string} phone - The phone number to hash
 * @returns {string} - The SHA256 hash of the normalized phone number
 */
function hashPhone(phone) {
  if (!phone) return '';
  
  try {
    // Remove all non-digit characters (spaces, dashes, parentheses, etc.)
    const normalizedPhone = phone.toString().replace(/[^\d]/g, '');
    
    // Check if we have a valid phone number (at least 10 digits)
    if (normalizedPhone.length < 10) {
      console.warn(`Phone number too short: ${phone}`);
      return '';
    }
    
    return hashSha256(normalizedPhone);
  } catch (error) {
    console.error(`Error hashing phone: ${error.message}`);
    return '';
  }
}

/**
 * Hash a name (first or last) according to Facebook standards
 * @param {string} name - The name to hash
 * @returns {string} - The SHA256 hash of the normalized name
 */
function hashName(name) {
  if (!name) return '';
  
  try {
    // Remove extra whitespace and convert to lowercase
    const normalizedName = name.toString().trim().toLowerCase();
    
    // Remove any non-alphabetic characters except spaces
    const cleanName = normalizedName.replace(/[^a-z\s]/g, '').trim();
    
    if (cleanName === '') {
      console.warn(`Name contains no valid characters: ${name}`);
      return '';
    }
    
    return hashSha256(cleanName);
  } catch (error) {
    console.error(`Error hashing name: ${error.message}`);
    return '';
  }
}

/**
 * Hash multiple user data fields for Facebook API
 * Returns an object with hashed values ready for Facebook API submission
 * @param {Object} userData - Object containing user data to hash
 * @param {string} userData.email - User's email address
 * @param {string} userData.phone - User's phone number
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @returns {Object} - Object with hashed user data arrays
 */
function hashUserData(userData) {
  const hashedData = {
    em: [], // emails
    ph: [], // phones
    fn: [], // first names
    ln: []  // last names
  };
  
  try {
    // Hash email
    if (userData.email) {
      const hashedEmail = hashEmail(userData.email);
      if (hashedEmail) {
        hashedData.em.push(hashedEmail);
      }
    }
    
    // Hash phone
    if (userData.phone) {
      const hashedPhone = hashPhone(userData.phone);
      if (hashedPhone) {
        hashedData.ph.push(hashedPhone);
      }
    }
    
    // Hash first name
    if (userData.firstName) {
      const hashedFirstName = hashName(userData.firstName);
      if (hashedFirstName) {
        hashedData.fn.push(hashedFirstName);
      }
    }
    
    // Hash last name
    if (userData.lastName) {
      const hashedLastName = hashName(userData.lastName);
      if (hashedLastName) {
        hashedData.ln.push(hashedLastName);
      }
    }
    
    return hashedData;
  } catch (error) {
    console.error(`Error hashing user data: ${error.message}`);
    return hashedData;
  }
}

/**
 * Validate that the input data meets Facebook's requirements
 * @param {Object} userData - User data to validate
 * @returns {Object} - Validation result with isValid flag and messages
 */
function validateUserData(userData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // At least one identifier is required
  if (!userData.email && !userData.phone) {
    validation.isValid = false;
    validation.errors.push('At least one identifier (email or phone) is required');
  }
  
  // Email validation
  if (userData.email && (!userData.email.includes('@') || !userData.email.includes('.'))) {
    validation.warnings.push('Email format appears invalid');
  }
  
  // Phone validation
  if (userData.phone && userData.phone.replace(/[^\d]/g, '').length < 10) {
    validation.warnings.push('Phone number appears too short');
  }
  
  return validation;
}

module.exports = {
  hashSha256,
  hashEmail,
  hashPhone,
  hashName,
  hashUserData,
  validateUserData
};
