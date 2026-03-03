import pool from "./db";

const initTables = async (): Promise<void> => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS baptisms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        baptismNo VARCHAR(255) NOT NULL,
        dateOfBaptism VARCHAR(255) NOT NULL,
        dateOfBirth VARCHAR(255) NOT NULL,
        age VARCHAR(255) DEFAULT '',
        fullName VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        fatherName VARCHAR(255) NOT NULL,
        motherName VARCHAR(255) NOT NULL,
        fatherResidence VARCHAR(255) NOT NULL,
        fatherProfession VARCHAR(255) NOT NULL,
        nationality VARCHAR(255) NOT NULL,
        placeofBirth VARCHAR(255) NOT NULL,
        godfatherName VARCHAR(255) NOT NULL,
        godfatherSurname VARCHAR(255) NOT NULL,
        godfatherResidence VARCHAR(255) NOT NULL,
        godmotherName VARCHAR(255) NOT NULL,
        godmotherSurname VARCHAR(255) NOT NULL,
        godmotherResidence VARCHAR(255) NOT NULL,
        placeOfBaptism VARCHAR(255) NOT NULL,
        priestName VARCHAR(255) NOT NULL,
        remarks VARCHAR(500) DEFAULT '',
        confirmedOn VARCHAR(255) DEFAULT '',
        confirmedAt VARCHAR(255) DEFAULT '',
        dateOfMarriage VARCHAR(255) DEFAULT '',
        marriedTo VARCHAR(255) DEFAULT '',
        placeOfMarriage VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS marriages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marriageNo VARCHAR(255) NOT NULL,
        marriageDate VARCHAR(255) NOT NULL,
        marriagePlace VARCHAR(255) NOT NULL,
        groomName VARCHAR(255) NOT NULL,
        groomSurname VARCHAR(255) NOT NULL,
        groomFatherName VARCHAR(255) NOT NULL,
        groomMotherName VARCHAR(255) NOT NULL,
        groomDateOfBirth VARCHAR(255) DEFAULT '',
        groomAge VARCHAR(255) DEFAULT '',
        groomChurchOfBaptism VARCHAR(255) NOT NULL,
        groomNationality VARCHAR(255) NOT NULL,
        groomAddress VARCHAR(255) NOT NULL,
        groomProfession VARCHAR(255) NOT NULL,
        groomMaritalStatus VARCHAR(255) DEFAULT '',
        groomIfWidowerWhose VARCHAR(255) DEFAULT '',
        brideName VARCHAR(255) NOT NULL,
        brideSurname VARCHAR(255) NOT NULL,
        brideFatherName VARCHAR(255) NOT NULL,
        brideMotherName VARCHAR(255) NOT NULL,
        brideDateOfBirth VARCHAR(255) DEFAULT '',
        brideAge VARCHAR(255) DEFAULT '',
        brideChurchOfBaptism VARCHAR(255) NOT NULL,
        brideNationality VARCHAR(255) NOT NULL,
        brideAddress VARCHAR(255) NOT NULL,
        brideProfession VARCHAR(255) DEFAULT '',
        brideMaritalStatus VARCHAR(255) DEFAULT '',
        brideIfWidowWhose VARCHAR(255) DEFAULT '',
        dateOfFirstBanns VARCHAR(255) DEFAULT '',
        dateOfSecondBanns VARCHAR(255) DEFAULT '',
        dispensation VARCHAR(255) DEFAULT '',
        firstWitnessName VARCHAR(255) NOT NULL,
        firstWitnessSurname VARCHAR(255) NOT NULL,
        firstWitnessAddress VARCHAR(255) NOT NULL,
        secondWitnessName VARCHAR(255) DEFAULT '',
        secondWitnessSurname VARCHAR(255) DEFAULT '',
        secondWitnessAddress VARCHAR(255) DEFAULT '',
        minister VARCHAR(255) NOT NULL,
        remarks VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS confirmations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        confirmationDate VARCHAR(255) NOT NULL,
        officiatingMinister VARCHAR(255) NOT NULL,
        sponsorName VARCHAR(255) DEFAULT '',
        churchName VARCHAR(255) NOT NULL,
        churchAddress VARCHAR(255) NOT NULL,
        churchContact VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS burials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        burialNo VARCHAR(255) NOT NULL,
        dateOfBurial VARCHAR(255) NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        age VARCHAR(255) DEFAULT '',
        nationality VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        profession VARCHAR(255) DEFAULT '',
        \`relationship\` VARCHAR(255) DEFAULT '',
        causeOfDeath VARCHAR(255) DEFAULT '',
        lastSacraments VARCHAR(255) DEFAULT '',
        dateOfDeath VARCHAR(255) NOT NULL,
        burialPlace VARCHAR(255) NOT NULL,
        minister VARCHAR(255) NOT NULL,
        remarks VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS no_objections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        dateOfBirth VARCHAR(255) NOT NULL,
        placeOfBirth VARCHAR(255) NOT NULL,
        reason VARCHAR(500) NOT NULL,
        recipientDetails VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scc VARCHAR(255) NOT NULL,
        familyId VARCHAR(255) DEFAULT '',
        registrationDate VARCHAR(255) NOT NULL,
        salutation VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        middleName VARCHAR(255) DEFAULT '',
        surname VARCHAR(255) NOT NULL,
        address1 VARCHAR(255) DEFAULT '',
        address2 VARCHAR(255) NOT NULL,
        address3 VARCHAR(255) NOT NULL,
        pincode VARCHAR(255) NOT NULL,
        res VARCHAR(255) DEFAULT '',
        office VARCHAR(255) DEFAULT '',
        mobile VARCHAR(255) NOT NULL,
        fax VARCHAR(255) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        familyType VARCHAR(255) DEFAULT '',
        motherTongue VARCHAR(255) DEFAULT '',
        otherLanguages VARCHAR(255) DEFAULT '',
        stateOfOrigin VARCHAR(255) DEFAULT '',
        previousParish VARCHAR(255) DEFAULT '',
        sinceMonth VARCHAR(255) DEFAULT '',
        sinceYear VARCHAR(255) DEFAULT '',
        housingType VARCHAR(255) DEFAULT '',
        housingStatus VARCHAR(255) DEFAULT '',
        remarks VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receiptNo VARCHAR(255) NOT NULL,
        dateOfReceipt VARCHAR(255) NOT NULL,
        receivedFrom VARCHAR(255) NOT NULL,
        familyCardNo VARCHAR(255) DEFAULT '',
        amount VARCHAR(255) NOT NULL,
        towards VARCHAR(255) NOT NULL,
        details VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voucherNo VARCHAR(255) NOT NULL,
        voucherDate VARCHAR(255) NOT NULL,
        payTo VARCHAR(255) NOT NULL,
        debitAccount VARCHAR(255) NOT NULL,
        amount VARCHAR(255) NOT NULL,
        tds VARCHAR(255) DEFAULT '',
        paymentMode VARCHAR(255) NOT NULL,
        chequeNumber VARCHAR(255) DEFAULT '',
        details VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS parish_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        address VARCHAR(500) DEFAULT '',
        city VARCHAR(255) DEFAULT '',
        pinCode VARCHAR(255) DEFAULT '',
        requestType VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'Pending',
        baptismFullName VARCHAR(255) DEFAULT '',
        baptismDateOfBirth VARCHAR(255) DEFAULT '',
        baptismDate VARCHAR(255) DEFAULT '',
        baptismParents VARCHAR(255) DEFAULT '',
        baptismGodparents VARCHAR(255) DEFAULT '',
        confirmationFullName VARCHAR(255) DEFAULT '',
        confirmationDate VARCHAR(255) DEFAULT '',
        marriageBrideName VARCHAR(255) DEFAULT '',
        marriageGroomName VARCHAR(255) DEFAULT '',
        marriageDate VARCHAR(255) DEFAULT '',
        marriageChurch VARCHAR(255) DEFAULT '',
        burialDeceasedName VARCHAR(255) DEFAULT '',
        burialDateOfDeath VARCHAR(255) DEFAULT '',
        burialDate VARCHAR(255) DEFAULT '',
        massType VARCHAR(255) DEFAULT '',
        massDateTimePreference VARCHAR(255) DEFAULT '',
        proposedWeddingDate VARCHAR(255) DEFAULT '',
        prepBrideName VARCHAR(255) DEFAULT '',
        prepGroomName VARCHAR(255) DEFAULT '',
        weddingLocation VARCHAR(255) DEFAULT '',
        coupleContact VARCHAR(255) DEFAULT '',
        noObjectionFullName VARCHAR(255) DEFAULT '',
        noObjectionDateOfBirth VARCHAR(255) DEFAULT '',
        noObjectionPlaceOfBirth VARCHAR(255) DEFAULT '',
        noObjectionReason VARCHAR(500) DEFAULT '',
        otherDetails VARCHAR(500) DEFAULT '',
        fee VARCHAR(255) DEFAULT '',
        paymentMode VARCHAR(255) DEFAULT '',
        paymentDetails VARCHAR(255) DEFAULT '',
        receivedBy VARCHAR(255) DEFAULT '',
        dateReceived VARCHAR(255) DEFAULT '',
        actionTaken VARCHAR(500) DEFAULT '',
        certificateIssuedDate VARCHAR(255) DEFAULT '',
        paymentReceived VARCHAR(255) DEFAULT '',
        amountReceived VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS mass_intentions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        contactNumber VARCHAR(255) NOT NULL,
        emailAddress VARCHAR(255) DEFAULT '',
        typeOfIntention VARCHAR(255) NOT NULL,
        otherIntention VARCHAR(255) DEFAULT '',
        nameOfPersonForIntention VARCHAR(255) NOT NULL,
        intentionDetails VARCHAR(500) DEFAULT '',
        slot1Date VARCHAR(255) DEFAULT '',
        slot1Status VARCHAR(255) DEFAULT '',
        slot2Date VARCHAR(255) DEFAULT '',
        slot2Status VARCHAR(255) DEFAULT '',
        slot3Date VARCHAR(255) DEFAULT '',
        slot3Status VARCHAR(255) DEFAULT '',
        slot4Date VARCHAR(255) DEFAULT '',
        slot4Status VARCHAR(255) DEFAULT '',
        preferredDateTime VARCHAR(255) DEFAULT '',
        offeringAmount VARCHAR(255) DEFAULT '',
        paymentStatus VARCHAR(255) DEFAULT '',
        paymentMode VARCHAR(255) DEFAULT '',
        bankName VARCHAR(255) DEFAULT '',
        accountNumber VARCHAR(255) DEFAULT '',
        ifscCode VARCHAR(255) DEFAULT '',
        referenceNumber VARCHAR(255) DEFAULT '',
        specialNotes VARCHAR(500) DEFAULT '',
        status VARCHAR(255) DEFAULT 'Pending',
        receivedBy VARCHAR(255) DEFAULT '',
        receivedDate VARCHAR(255) DEFAULT '',
        confirmedDateTime VARCHAR(255) DEFAULT '',
        paymentReceived VARCHAR(255) DEFAULT '',
        receiptNo VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        category VARCHAR(255) NOT NULL,
        liturgicalSeason VARCHAR(255) DEFAULT '',
        announcementDate VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'Draft',
        isRecurring VARCHAR(255) DEFAULT 'No',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_announcementDate (announcementDate),
        INDEX idx_liturgicalSeason (liturgicalSeason)
      )
    `);

    console.log("All MySQL tables initialized");
  } finally {
    conn.release();
  }
};

export default initTables;
