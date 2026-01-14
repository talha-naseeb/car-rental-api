const db = require("../config/db.config");

exports.getCompanyData = async (req, res) => {
  try {
    const [settings] = await db.query("SELECT * FROM company_settings LIMIT 1");
    const [deliveryAreas] = await db.query("SELECT * FROM delivery_areas WHERE is_active = true");

    // Structure the response
    const companyData = {
      info: {
        ...settings[0],
        social_media: {
          facebook: settings[0]?.facebook_url,
          twitter: settings[0]?.twitter_url,
          instagram: settings[0]?.instagram_url,
        },
      },
      pricing_policies: {
        registration_fee: settings[0]?.registration_fee,
        local_tax_percent: settings[0]?.local_tax_percent,
        included_kms: settings[0]?.standard_included_kms,
      },
      delivery_areas: deliveryAreas,
    };

    res.status(200).json(companyData);
  } catch (err) {
    console.error("Error fetching company data:", err);
    res.status(500).send({ message: "Error retrieving company data." });
  }
};
