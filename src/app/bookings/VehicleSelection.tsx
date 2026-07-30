// VehicleSelection.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
} from "react-native";
export default function VehicleSelectionScreen() {

    // Get selected vehicle type from previous screen
    const {
        vehicleType: vehicleTypeParam,
        onboarding,
        source,
        returnTo,
    } = useLocalSearchParams<{
        vehicleType?: string;
        onboarding?: string;
        source?: string;
        returnTo?: string;
    }>();
    const vehicleType = vehicleTypeParam === "two" ? "two" : "four";

    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedModel, setSelectedModel] = useState("");

    // -----------------------------
    // FOUR WHEELER COMPANIES
    // -----------------------------
    const fourWheelCompanies = [
        "Hyundai",
        "Maruti Suzuki",
        "Tata",
        "Mahindra",
        "Toyota",
        "Honda",
        "Kia",
        "MG",
        "Skoda",
        "Volkswagen",
        "Renault",
        "Nissan",
        "Jeep",
        "BMW",
        "Mercedes",
        "Audi",
        "Volvo",
    ];

    // -----------------------------
    // TWO WHEELER COMPANIES
    // -----------------------------
    const twoWheelCompanies = [
        "Hero",
        "Honda",
        "TVS",
        "Bajaj",
        "Royal Enfield",
        "Yamaha",
        "Suzuki",
        "KTM",
        "Jawa",
        "Yezdi",
        "Kawasaki",
        "Triumph",
        "Harley-Davidson",
        "BMW Motorrad",
    ];
const companyLogos: Record<string, string> = {
    Hyundai: "https://freepngimg.com/convert-png/20764-hyundai-logo",
    "Maruti Suzuki": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDftK1hACvKzui81cYT52dhvHVBMPY4mFOG3Osr3759A&s=10",
    Tata: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdISDrA51Xa1LC389487jm_-clkhPZG_mQYyOSaANz4gyr6ZwmswaDE_Vw&s=10",
    Mahindra: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcWvMkI42LI0VjXbUjbXhlzfiZ9n3MSYs1a-z1GDtOdQ&s=10",
    Toyota: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRImSFqXOcu4V-ZJRtew7mzTtrvweLyyaa1X0wqJDKzog&s=10",
    Honda: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwaa6bEsA7A1fXm7yX3H3TPlp5aNDM8UGn0xvp95nxeg&s=10",
    Kia: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO2eulAJXMjh7EoasUkrgUluPxpkfQUYYTdK8-MBZkdg&s",
    MG: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTADV_D7qn9emVLUqoBepg2Jxo7_DkMlNvq_1TL8Kk2Eg&s=10",
    Skoda: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGwOvpcZS9G_lFsWfQ-w_hsttIRPA1VbRHa5jaLQjbXg&s=10",
    Volkswagen: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Volkswagen_logo.png",
    Renault: "https://i.pinimg.com/736x/be/64/41/be64410ab475859be5c437fd66b0d22e.jpg",
    Nissan: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXxVbhH_C58WOsdc3gaB1S-hx4rQH3JUjy34MwULNFtA&s=10",
    Jeep: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm6M4eV3LJ63YgaLMl2R17gOSqmrHgK1cAQoaerLIMJw&s=10",
    BMW: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStEYsoGdGuLQqJ-90-2jSUmj_RBqg2eBZTVXrIOvrHMg&s=10",
    Mercedes: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTfW0hk7HkkKpBOw_yWvAJ8t3-WtgEgCEfvMyhJFYmiw&s=10",
    Audi: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu8hcThMDo8mxmqacU7J7RJxoA1l0-lFxVq_YT0MbedQ&s=10",
    Volvo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1zG6eg-yLp8KKw-Jn1qvoMMBwZiNJKpICa2NC4jTdVw&s=10",

    Hero: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFOrAGFKYCjSe5k2loOkMIBegB6f0-0Rm3a-NqaVhZrA&s=10",
    TVS: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjYekqnnfUegTxVJw9RS3DuJ409V1NeH83PGzXb9ISMw&s=10",
    Bajaj: "https://1000logos.net/wp-content/uploads/2020/07/Bajaj-logo.jpg",
    "Royal Enfield": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhOmcL_VswJMJCYY9HDKcaGNQBSyrHwT6-sgwgqrsDMg&s=10",
    Yamaha: "https://static.vecteezy.com/system/resources/previews/020/336/399/non_2x/yamaha-logo-yamaha-icon-free-free-vector.jpg",
    Suzuki: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrqSiMemtWk2Zl2UPdKr-s7ezx2ag5uqisBFwHBizrdg&s=10",
    KTM: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-DPZYQ9tDRid6bbODwrVbLW6B4Mc9GTAqM7YUNmwANg&s=10",
    Jawa: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4TmOaIspVhxb5RKCCC_Zdt4NqWXbAk40DlJa51mRvCA&s=10",
    Yezdi: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVx26ae5CbPcXF0mdKwkxIJ1WsUSUVsx_oXTSn0dm-&s=10",
    Kawasaki: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTYggufg-e0H5NWiVZCdard6QqRm__B5h1jr14VuaTBQ&s=10",
    Triumph: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZyHd9ea2IDtyujvv6UKMdi6bG7AwSl6BJN32_cRTqgg&s=10",
    "Harley-Davidson": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvuI4AaDT2319nF_U8R2wltshpMKc0olxXhfWn7h5IWA&s=10",
    "BMW Motorrad": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqL_9LpbSOvA4YLvogtGhW9W6h3AtoI8SfCEHRuOv5BA&s=10",
};
const modelImages: Record<string, string> = {
    // Hyundai
    "Creta": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRZGC4Z4Fd0vUlpUAiPQXh3k5p72xTWip_HHqbyitq0dpGVkLX5EY_PvMcm7-79aGwDWlKeQMmOvaoNrChiGGj-ZIGXx9cUAcWRCSCBg83STMT-102M4fh5pw",
    "Venue": "https://mc.bajajfinserv.in/media/catalog/product/h/y/hyundaivenueefieryred_base.jpeg",
    "i20": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIfC8tUZSIzyHNVzjWxy4E3WMVHI6quvJu5IXHuBOFGw&s=10",
    "Verna": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMMFT3-coQA_Sl7iBzQ39xpVFUzWluAatL5DONejmzVQ&s=10",
    "Aura": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-VS0Brkf9v5sIYzqLNWkSqIu69AkAvP2n4wnjHynwKw&s=10",
    "Exter": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAjeELcpLvK5-Ro8ryBNH_9FM-LAHwBWBHkE36NijAcQ&s=10",
    "Alcazar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmMsyKKNYHRVcdYA5geXVtHPAKCa-_CkUVzwaqf1PehA&s",
    "Tucson": "https://images.garipoint.com/get_new_car_images.php?width=580&height=320&path=model_images/hyundai/tucson/hyundai-tucson-Phantom-Black.jpg",

    // Maruti Suzuki
    "Swift": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTea8qF5XveF-A3rnjE4IRBb5bSYVk0G8GFkAlNvymJJQ&s=10",
    "Baleno": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR06TZyjKnml7erEIXV2sEhCyjW2UXAR9iYUV7m-weYWA&s=10",
    "Dzire": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyZpsfPAmVyLgwVIpJ5fGL8UucHkfC4P8J_C6Jb_gS_A&s=10",
    "Brezza": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLc-vWFGwjVSlJnRvkEX4GbjchIFaPZtSVDxFiF3xb0Q&s=10",
    "Fronx": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ91VeizCAT0AcxJ6tIhviCV6DqN5pY9v8uwuv_f6pVTA&s=10",
    "Grand Vitara": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbiwwk6itndP_x2jF87uwo8pOiq8lswu54n0NC8tu55g&s=10",
    "Ertiga": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsO6uafUwZZvybqyJqyi8a_IakdzMyBa_jsomYJsmfXw&s=10",
    "WagonR": "https://images.jdmagicbox.com/quickquotes/images_main/wagon-r-lxi-cng-superior-white-82691883-ce0yc.jpg",

    // Tata
    "Punch": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrPDXx2ehZz8FLuEMEMeH5Kygj-USBunyX-dwvDBJgEw&s=10",
    "Nexon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkMp2BEJM-w_ICWa92H9-7OlOQX2QQoY6ibJFP3YS1Aw&s",
    "Harrier": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQti-18ZCI_CFjo2NyyNTCQ0qciTRv51265durSRQvSQ&s=10",
    "Safari": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_tlibCIcKQWzKaaAvdn4q3d0-py7AN-rYl8YhJP82Qg&s=10",
    "Altroz": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6kAdcTkubJWGSHtSV1NNJ3078cJ5wh3YH0B8M6y86qg&s=10",
    "Tiago": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLaA5uydZ343dRC8vn-k5v8cYDWxLMz4RlVRZKq48bZA&s=10",
    "Curvv": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnHfDLvB2Z6XXXcNQHaTRNQz6X3yklaFQurTfwEAF0ew&s=10",

    // Mahindra
    "Thar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGH1JA8Dknn0qvJnTIIRoEdS7upqjYvaru1fIxy0TJEQ&s=10",
    "Scorpio N": "https://mda.spinny.com/sp-file-system/public/2024-11-30/cddac6c803564277a9eb3dc4916499c2/raw/file.JPG",
    "XUV700": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZetQDGNRU0j3Hyyx3Ih4ey8MIxI9Xhq5WYKZKTVJslw&s=10",
    "Bolero": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-hxeinIoaRnHXqpXgM9UJ0KOCuYXfZBRPmb1aJ5prCA&s=10",
    "XUV 3XO": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ_xG_AO9CQGd0HAbD6doCLw3KsvLpYFPN4FxCk1ycvQ&s=10",
    "BE 6": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJwcbL0bvKCsBGosBGo7mMh9zPVHlLcxtNSXIYF329mg&s=10",

    // Toyota
    "Fortuner": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2ZKVZvNrSzAT6vXEhvkHtz_sL-RDRPrCqsvW5xR5xZA&s=10",
    "Innova Hycross": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3uVDvcG8TM3LEUcWFxktB7E6EuI59ErTlMiSvADa5Cw&s",
    "Corolla Altis": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvRJndB6TIFSpq-khQNrGodZCrNAlBVmWyAV5Fx7HQZw&s=10",
    "Hyryder": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKYZ6FkuOja5ltzcqqp9DMgVIeBAOj3n6WiUgnQqRJAw&s=10",
    "Camry": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBDSrKXAYLcwcQcmbNBAYWkumJzeR7LapLbNkhhk9OBw&s=10",

    // Honda
    "City": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV3S9VuYaiR6eN1_ie2jPrwm1gKYYEQmEKu0scjNDNFA&s=10",
    "Elevate": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM0aAsvXu4Dmjx7zEH37HHJbJr9PYEnU0AsmK-_bTIvQ&s=10",
    "Amaze": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq5HtNZo8B5qdq3SwwuSr8068HNZdqqT8hnOpFTtLQJQ&s=10",

    // Kia
    "Seltos": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMQl0WBztLmiEe1QGzy_VED8PhbAHkRH742ZEJePlfHQ&s=10",
    "Sonet": "https://carhatke.com/image/cache/catalog/catalog-new-images/cars-pics/kia-sonet-accessories-1000x1000w.png",
    "Carens": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF7w4p34M0o_VQA0uXHVpkCjD5jlCk-noRrft0y49-xA&s=10",
    "Carnival": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgZmLKwIhL-wtLFcF6ohHeSdR61ESUC0BWHxUzFeGtbA&s=10",

    // MG
    "Astor": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUsifgKg7lM-uOyHZlXx5mbPrvzMP2gCfRM2HN9li5vQ&s=10",
    "Hector": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAb1kQmtQmqdt86Yvb2L2ISsiapxHuK9FHFxGV_G6x3A&s=10",
    "Comet EV": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLLsxl5Ca9_6nN_hxac1mVbn24gmccU-cMBIvwWnfZ2w&s=10",
    "ZS EV": "https://mgmotor.scene7.com/is/image/mgmotor/zs-img-dsc-0318?$mg-rgb-tablet-image-responsive$&fmt=png-alpha",

    // Skoda
    "Kylaq": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaITdYvkverqUAAbhhnevANxyPcHR6AIabVRA-aV3bQw&s=10",
    "Kushaq": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKcs-PBDly-PUDEjTUpaCJHQQTFx305nuK6nXzuLZvow&s=10",
    "Slavia": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK42kW2FTE682_fJkDs38yzjHH3teQnz4DCJzkq_8EhQ&s=10",
    "Superb": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyMF5xjYr1KHdGd_tIb4GW_bc-aw9_TrL_U7b7ZeySVg&s=10",

    // Volkswagen
    "Virtus": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThIoBp7O5xBE_dQxUAm1xogwlKtMspYpbkxCo0GBD0uw&s=10",
    "Taigun": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRU8tnFvb3DwvGddTe5kK1LGPwoWwXqoTWMYwCJNtsdQ&s=10",
    "Tiguan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBY8qfvt7YD2Ib8h_U1tGr0vcZIO-j_HT-rRCzUEgp0w&s=10",

    // Renault
    "Kwid": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0iDtsfW0_TWTnAmRABbVi-PcIIwJAm1L9vKgl-QcfHw&s=10",
    "Kiger": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa7cXSojfP5cVZZ1XChJR4zFcWunIqOFOCQ1eKEaN4gw&s=10",
    "Triber": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyW_LCG01XXNoqtQ-ANgiToA6SVH4fggBgSLeERTxotg&s=10",

    // Nissan
    "Magnite": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_K-V0gBjDxFNg1tx5nlUbDty7RRFdyRLKBZcfX9VOHw&s=10",
    "X-Trail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrP42Vovm473g0k6sA-JrTHWkwNq4K3EFXKrCvE624ow&s=10",

    // Jeep
    "Compass": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFNKRwoHuprLbDYNouq2XfMS-936Kvo82T_xE4qNMthw&s=10",
    "Meridian": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWhheQrPDSNYkLtXgldVH8rTTesz7zcefALi7LG9e7sg&s=10",
    "Wrangler": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRo8255hDvJBR3u68J89iB7gq_6WPRXEkeqlcJc6QcEg&s=10",

    // BMW
    "X1": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzXZHT9bBdpN7ZpTwVPDFoqU9cwR89kSaz-LMsyQbG8A&s=10",
    "X3": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd4ohP2EPiZJR22MbLNgN0dn056IkgU3RzNR8DCBTvCw&s=10",
    "X5": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrnuQ8wCm74zweQjhLO9yvvAEo4dYX9dfLJWDfkiI8GA&s=10",
    "3 Series": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6qG6LDQkz3IYXbffFoOtCL4Xc0nvLv8CumNqCLNKrAA&s=10",
    "5 Series": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_pDt9BA3W2nhB0mtOCEJGfPHQPCKfyECnb3ERfGuU_Ve9xKIY8bv180nU&s=10",
    "7 Series": "https://png.pngtree.com/png-vector/20250513/ourmid/pngtree-sleek-gray-bmw-7-series-sedan-against-a-black-background-png-image_16239844.png",

    // Mercedes
    "A Class": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCvpI8XdPeAM-RA6SQakE4sLXo7wGGVkDEhtt0UeWFNQ&s",
    "C Class": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd7AX1-_Vl3TQdB9UN1kC5tBzke9aOls7z14d5mNO6VA&s=10",
    "E Class": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWAQXYKDMqL98qXHg6slYGf2MSuUA3uUtKD5jWVmwurg&s",
    "GLA": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9nm-Qy0nZph8TPdTCzE0aXbcqUZCF_yefb2MhMlgrkg&s=10",
    "GLC": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-xTvvLj0pp4_wCzB9EMZEqliIj8FquKWGkSht_P608g&s=10",
    "GLE": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStWB8Uym5qJ75h_y8aaEV5pEyR5r-PZGrcTQJer6i9KA&s=10",

    // Audi
    "A4": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqOjJk0UyGpcJNlhAB4hmu9RrmA7aQcL9-nS_EhJ4kXA&s=10",
    "A6": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4RBkH9ceofRUk8jxCsdqIlyBAmyHwFvPQPCBwJuPTbQ&s=10",
    "Q3": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4-brvVRhYGkeuC_6Vi4Y_0bwyVJT30AGYl9VfjHh9Fw&s=10",
    "Q5": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnFmVcz1Ek0WsXy5RWmeCKSq1hcLLQN7j1hFyeOmQnRQ&s=10",
    "Q7": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqOjJk0UyGpcJNlhAB4hmu9RrmA7aQcL9-nS_EhJ4kXA&s=10",

    // Volvo
    "XC40": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQund_H7d78-VTBHypp1BfevxTnN3F4pjbv1djJRGfqMQ&s",
    "XC60": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVGYszAmoDhX98061ZeIy_qQf7vhjm1lmhftuO4gi1ZA&s",
    "XC90": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2_Ac2pO1wNpxHebw4NjJZesG3EIkqW3RhT0Y48gyo7Q&s=10",

    // Hero
    "Splendor Plus": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz0ufU-y8CBR3zQuRAZgSMjF5ohePQ9VJ2VJddrrfE3g&s=10",
    "HF Deluxe": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLqPnLzYKzfglWJoTI0ZovURfcgEt2ibj_PNSeNJJiPQ&s=10",
    "Passion XTEC": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ThpZMyUu0g7WtJ9I1hIHYUB_BszPR04v1G_C3rhwCA&s=10",
    "Xtreme 125R": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjg2eLAJ_nn4ScOyEYzOAGP0-V1gSuRNb_DmdW1R8aCQ&s=10",
    "Xpulse 200": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLQ3SKQvW68GbLBSSdBSYM4UHKbMJ9QrE6djY5CRCVXA&s=10",

    // Honda Bikes
    "Shine": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9nYNjSk6J455Sf2AXADg0ZuVfSwcRlP-milRBqTxpQA&s=10",
    "SP125": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYG1D2J_-QNTkcxyp2cn2Q4iiDhw9AquWLYXSrEbaMKQ&s=10",
    "Unicorn": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayLgzh8waTYTkm8knb4Fln9MJFnR04VeNlKy6fIXmqQ&s=10",
    "Hornet 2.0": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYxXS4n8yoeaJDQynlS47SD1A4cX3wub67yV5am9kuOw&s=10",
    "Activa 6G": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_z_ZMF-cg-87TqPZuDVn6LX2JOYwLGgBrGHsmzQPuUQ&s=10",
    "Dio": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0lVey1ZaTHPDbl7yOPxqxtUxH15XRvtVQJGA3A0K22g&s",

    // TVS
    "Apache RTR 160": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa3lwkxQPYSc1ociG9vG-3D2tnPgz4xQbja6B0SCH_hA&s=10",
    "Apache RTR 200": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ9AoAUsEcK0MfL_gy1_uCYsGkGyy9xm6blvipPhbjXg&s=10",
    "Ronin": "https://auto.hindustantimes.com/_next/image?url=https%3A%2F%2Fauto.hindustantimes.com%2Fcms-images%2Ftvs_ronin%2Fimages%2Fexterior_tvs-ronin_front-right-side_930x620.jpg&w=1920&q=75",
    "Raider": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8f57myyOLPZI9sVOpZbTQIzzS-Xbx-JnqKk2HJg7l2A&s=10",
    "Jupiter": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYE7DSMXFM81E23sEu9qNQgGCQmmaPW-qzXwwG7qQnwA&s=10",
    "NTorq": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeDt4NTFgfiAyS7JxIAAnS6eMWHxF5hwuWKsPvx1FitQ&s",

    // Bajaj
    "Pulsar N160": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdgNxZtMYm1PaKrMd3btJvZPxIu34InDdJIgUu4WZTew&s=10",
    "Pulsar NS200": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ573aWTFw6uLl8Y0EhnlQlRPwnG9r1WUBVvY145wZ1nw&s=10",
    "Dominar 400": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRYguEPTBUz1hX9H0xEBzErWyUWEqHAdV3LU-U3i5zhw&s=10",
    "Avenger": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgTy2rtTeNNFI62KujkBALFk0SEpuI0iLzIcyzcdgGqg&s=10",
    "Chetak EV": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxqVdi2q-FPq4lyjVIwkIrcOOlq5uf3MiWnIZArG8LVQ&s=10",

    // Royal Enfield
    "Classic 350": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGr7U_y1HRun3yyXENJUzP03QYAq73ZgI9-dX8d27Ajw&s",
    "Hunter 350": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSKWUBvREoALAdsgue8eYr7_t8KY_JaJVJAUi25BItVw&s=10",
    "Meteor 350": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwGupMhDjO8ToCXhFP2WR2kVLogb4DKog5Qu2NvrTxMQ&s",
    "Bullet 350": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRemke58CoahlaEXEBrv8HsyLqtUz7vE2t6B81_LikJEw&s",
    "Himalayan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfmIAcfVtsCgdPk7pyuzuQv3NP6_S-lKFXH22eVq28SA&s=10",

    // Yamaha
    "R15": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkm5PuBDgFupMN0wCMyg6j1wceB9F6MaH8AWKc6cJ1LA&s=10",
    "MT15": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDtlHXPT2pbg7y_lFXrLjZrjkNCicRa4mUHwXIQJYq3g&s=10",
    "FZ-S": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLv6i49lAEAZM0XXafTXV0xU5COBfOmoX1riOYEG67fw&s=10",
    "Aerox 155": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7RauF229B8xqJ3GY-0yY2pQnnjUrDacHoXeXHNjTuSQ&s=10",
    "RayZR": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTinTzwSwk8zeCQkzdrisNLt2fR9t9sOZ0o4a3NyJVD7A&s=10",

    // Suzuki
    "Access 125": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBrnUbYXv7c56AzI12C8SoBtDyxUWKEzj1z8VCY0lJzA&s=10",
    "Burgman": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ-71KHCa1cOAXXd9aqxznv_fxe3pTTXyEFU1J2ceTCg&s=10",
    "Gixxer": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX19sMKgdvfVVdtyuRzZAeLkJDQLalGSGzDqME5NNV3w&s=10",
    "V-Strom SX": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmwCsYm5bvt2sQNwNLc_OnuC-GIVaiVTSD8n-3r93pZA&s=10",

    // KTM
    "125 Duke": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_KSeWP7kmcH_AY3jissTqMfT7njzbeKJ3qtCdefu2w&s=10",
    "200 Duke": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuaPpVZN5TP9eLps7VzUsZ16fWziKQkXuJpIsH7BkAbA&s=10",
    "250 Duke": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStMbQ5-SsVrFwXuwIaIVrL6Sbpfs2TYwoqg1qPSYGBYA&s",
    "390 Duke": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi242-fv5vtVX9iV5ZVhtF_cX4dTX7FiUcaD1Wy49dRg&s",
    "RC 390": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgcRH71tbKhxsJEGYfI1BmtY0XchuG4QFR_cp75ykdVQ&s=10",

    // Jawa
    "42": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMRkFFIoutXYVoAoYokUx9bhgLun3S0bwFiNYSTWU5FA&s",
    "42 Bobber": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh1xcwali3zRBgFJIpAaPjjQ2wXOMgGWdjSj1Ov3Y6zg&s=10",
    "Perak": "https://cdn.bikedekho.com/upload/userfiles/images/68e4e9e2a40c1.png?tr=w-930?impolicy=resize&imwidth=420",

    // Yezdi
    "Roadster": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6NW9Vu6LGANfD7g2iUiDbxaFKDJLoWjTcebqxuPCKIQ&s",
    "Adventure": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLxPeQJvAUBSbl4NsMAkk_P7YGZd5SdbOcxqGIeqrCxQ&s=10",
    "Scrambler": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2cYEN1TTC2BUu0t56RIiUyKoMRyM2fPciwOoT6Gnnxg&s=10",

    // Kawasaki
    "Ninja 300": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSkFizvVefc8E7c9R0GvjuUP0JFhO__sFR74McdbpqjA&s=10",
    "Ninja ZX-6R": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZy75jHFhsVqt67E6rw6IMzD16wQ9_pZsPhfKfzjscAA&s=10",
    "Z900": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk8S-lV5_TwDYwFsAzuCeKV7G8PZ5JdI92VJJYUgUxXg&s=10",

    // Triumph
    "Speed 400": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5IlPzsHmuTiXOXicUxhyEa5YCyUhvLiuucUuBvkwBMA&s=10",
    "Scrambler 400X": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlf0p5jPS3BtY4KH_lse682eqz3bvU8LAN2K2pYwmUIg&s",

    // Harley-Davidson
    "X440": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhgdSk-YUvycW9yXTl7aADoHJovRdoxpE4DPL69Dnb1g&s=10",

    // BMW Motorrad
    "G310R": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpHZxQ7rWFxduSlqjVuBfmxReulsqqKuvx8eswAcxE8w&s=10",
    "G310GS": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDWxaj13JK_no42EWW8-ZuJ42J0E3SB__T2985_oHpuw&s=10",
};
    // -----------------------------
    // FOUR WHEELER MODELS
    // -----------------------------
    const fourWheelModels: any = {

        Hyundai: [
            "Creta",
            "Venue",
            "i20",
            "Verna",
            "Aura",
            "Exter",
            "Alcazar",
            "Tucson",
        ],

        "Maruti Suzuki": [
            "Swift",
            "Baleno",
            "Dzire",
            "Brezza",
            "Fronx",
            "Grand Vitara",
            "Ertiga",
            "WagonR",
        ],

        Tata: [
            "Punch",
            "Nexon",
            "Harrier",
            "Safari",
            "Altroz",
            "Tiago",
            "Curvv",
        ],

        Mahindra: [
            "Thar",
            "Scorpio N",
            "XUV700",
            "Bolero",
            "XUV 3XO",
            "BE 6",
        ],

        Toyota: [
            "Fortuner",
            "Innova Hycross",
            "Corolla Altis",
            "Hyryder",
            "Camry",
        ],

        Honda: [
            "City",
            "Elevate",
            "Amaze",
        ],

        Kia: [
            "Seltos",
            "Sonet",
            "Carens",
            "Carnival",
        ],

        MG: [
            "Astor",
            "Hector",
            "Comet EV",
            "ZS EV",
        ],

        Skoda: [
            "Kylaq",
            "Kushaq",
            "Slavia",
            "Superb",
        ],

        Volkswagen: [
            "Virtus",
            "Taigun",
            "Tiguan",
        ],

        Renault: [
            "Kwid",
            "Kiger",
            "Triber",
        ],

        Nissan: [
            "Magnite",
            "X-Trail",
        ],

        Jeep: [
            "Compass",
            "Meridian",
            "Wrangler",
        ],

        BMW: [
            "X1",
            "X3",
            "X5",
            "3 Series",
            "5 Series",
            "7 Series",
        ],

        Mercedes: [
            "A Class",
            "C Class",
            "E Class",
            "GLA",
            "GLC",
            "GLE",
        ],

        Audi: [
            "A4",
            "A6",
            "Q3",
            "Q5",
            "Q7",
        ],

        Volvo: [
            "XC40",
            "XC60",
            "XC90",
        ],
    };

    // -----------------------------
    // TWO WHEELER MODELS
    // -----------------------------
    const twoWheelModels: any = {

        Hero: [
            "Splendor Plus",
            "HF Deluxe",
            "Passion XTEC",
            "Xtreme 125R",
            "Xpulse 200",
        ],

        Honda: [
            "Shine",
            "SP125",
            "Unicorn",
            "Hornet 2.0",
            "Activa 6G",
            "Dio",
        ],

        TVS: [
            "Apache RTR 160",
            "Apache RTR 200",
            "Ronin",
            "Raider",
            "Jupiter",
            "NTorq",
        ],

        Bajaj: [
            "Pulsar N160",
            "Pulsar NS200",
            "Dominar 400",
            "Avenger",
            "Chetak EV",
        ],

        "Royal Enfield": [
            "Classic 350",
            "Hunter 350",
            "Meteor 350",
            "Bullet 350",
            "Himalayan",
        ],

        Yamaha: [
            "R15",
            "MT15",
            "FZ-S",
            "Aerox 155",
            "RayZR",
        ],

        Suzuki: [
            "Access 125",
            "Burgman",
            "Gixxer",
            "V-Strom SX",
        ],

        KTM: [
            "125 Duke",
            "200 Duke",
            "250 Duke",
            "390 Duke",
            "RC 390",
        ],

        Jawa: [
            "42",
            "42 Bobber",
            "Perak",
        ],

        Yezdi: [
            "Roadster",
            "Adventure",
            "Scrambler",
        ],

        Kawasaki: [
            "Ninja 300",
            "Ninja ZX-6R",
            "Z900",
        ],

        Triumph: [
            "Speed 400",
            "Scrambler 400X",
        ],

        "Harley-Davidson": [
            "X440",
        ],

        "BMW Motorrad": [
            "G310R",
            "G310GS",
        ],
    };

    // Automatically decide which list to use
    const companies =
        vehicleType === "two"
            ? twoWheelCompanies
            : fourWheelCompanies;

    const models =
        vehicleType === "two"
            ? twoWheelModels[selectedCompany] || []
            : fourWheelModels[selectedCompany] || [];

    function handleContinue() {

    if (selectedCompany === "") {
        Alert.alert("Vehicle Company Required", "Please select a vehicle company.");
        return;
    }

    if (selectedModel === "") {
        Alert.alert("Vehicle Model Required", "Please select a vehicle model.");
        return;
    }

    router.push({
    pathname: "/bookings/VehicleDetails",
    params: {
        company: selectedCompany,
        model: selectedModel,
        vehicleType,
        onboarding: onboarding ?? "false",
        source: source ?? "vehicle-selection",
        returnTo: returnTo ?? "/tabs/HomeScreen",
    },
});
}
    function handleBack() {
  if (router.canGoBack()) {
    router.back();
  } else if (returnTo) {
    router.replace(returnTo as never);
  } else {
    router.replace("/tabs/HomeScreen");
  }
}

    return (
    <View style={styles.safeArea}>
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.card}>

                {/* Header */}

                <View style={styles.topIconCircle}>
                    <Text style={styles.topIconText}>
                        {vehicleType === "two" ? "🏍️" : "🚗"}
                    </Text>
                </View>

                <Text style={styles.heading}>
                    Select Your Vehicle
                </Text>

                <Text style={styles.subtitle}>
                    Choose your company and model to continue.
                </Text>

                {/* Vehicle Type Badge */}

                <View style={styles.vehicleTypeBadge}>
                    <Text style={styles.vehicleTypeText}>
                        {vehicleType === "two"
                            ? "🏍 Two Wheeler"
                            : "🚗 Four Wheeler"}
                    </Text>
                </View>

                {/* Company Section */}

                <Text style={styles.sectionTitle}>
                    1. Select Company
                </Text>

                <View style={styles.companyContainer}>
                    {companies.map((company) => (

                        <TouchableOpacity
                            key={company}
                            activeOpacity={0.8}
                            style={
                                selectedCompany === company
                                    ? styles.companyCardSelected
                                    : styles.companyCard
                            }
                            onPress={() => {
                                setSelectedCompany(company);
                                setSelectedModel("");
                            }}
                        >

                           <View style={styles.logoCircle}>
                           <Image
                          source={{ uri: companyLogos[company] }}
                           style={styles.logoImage}
                           resizeMode="contain"
                           />
                          </View>
<Text
                                style={
                                    selectedCompany === company
                                        ? styles.companyNameSelected
                                        : styles.companyName
                                }
                            >
                                {company}
                            </Text>

                        </TouchableOpacity>

                    ))}

                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.notListedButton}
                    onPress={() =>
                        router.push({
                            pathname: "/bookings/EditVehicle",
                            params: {
                                vehicleType,
                                manual: "true",
                                onboarding: onboarding ?? "false",
                                source: source ?? "vehicle-selection",
                                returnTo: returnTo ?? "/tabs/HomeScreen",
                            },
                        })
                    }
                >
                    <Text style={styles.notListedTitle}>
                        Can't find your vehicle?
                    </Text>

                    <Text style={styles.notListedSubtitle}>
                        Tap here to add it manually
                    </Text>
                </TouchableOpacity>

                {/* Model Section */}

                {selectedCompany !== "" && (

                    <>

                        <Text style={styles.sectionTitle}>
                            2. Select Model
                        </Text>

                        <View style={styles.modelContainer}>

{models.map((model: string) => (
    <TouchableOpacity
        key={model}
        activeOpacity={0.8}
        style={
            selectedModel === model
                ? styles.modelCardSelected
                : styles.modelCard
        }
        onPress={() => setSelectedModel(model)}
    >
        <Image
            source={{ uri: modelImages[model] }}
            style={styles.modelImage}
            resizeMode="contain"
        />

        <Text
            style={
                selectedModel === model
                    ? styles.modelNameSelected
                    : styles.modelName
            }
        >
            {model}
        </Text>
    </TouchableOpacity>
))}

                        </View>

                    </>

                )}

                {/* Summary */}

                <View style={styles.summaryBox}>

                    <Text style={styles.summaryHeading}>
                        Selected Vehicle
                    </Text>

                    <View style={styles.summaryRow}>

                        <Text style={styles.summaryLabel}>
                            Type
                        </Text>

                        <Text style={styles.summaryValue}>
                            {vehicleType === "two"
                                ? "Two Wheeler"
                                : "Four Wheeler"}
                        </Text>

                    </View>

                    <View style={styles.summaryRow}>

                        <Text style={styles.summaryLabel}>
                            Company
                        </Text>

                        <Text style={styles.summaryValue}>
                            {selectedCompany || "--"}
                        </Text>

                    </View>

                    <View style={styles.summaryRow}>

                        <Text style={styles.summaryLabel}>
                            Model
                        </Text>

                        <Text style={styles.summaryValue}>
                            {selectedModel || "--"}
                        </Text>

                    </View>

                </View>

                {/* Continue */}

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.continueButton}
                    onPress={handleContinue}
                >

                    <Text style={styles.continueButtonText}>
                        Continue
                    </Text>

                </TouchableOpacity>

                {/* Back */}

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.backButton}
                    onPress={handleBack}
                >

                    <Text style={styles.backButtonText}>
                        ← Back
                    </Text>

                </TouchableOpacity>

            </View>

        </ScrollView>

    </View>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF2FF",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 40,
  },

  card: {
    width: "94%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "#DCE7F5",

    shadowColor: "#173A6A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 7,
  },

  topIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#123A7A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,

    shadowColor: "#123A7A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  topIconText: {
    fontSize: 44,
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#123A7A",
    textAlign: "center",
    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
    fontWeight: "500",
  },

  vehicleTypeBadge: {
    alignSelf: "center",
    backgroundColor: "#EEF5FF",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#CFE0F7",
    marginBottom: 28,
  },

  vehicleTypeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 15,
    marginTop: 4,
  },

  companyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  companyCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#DCE7F5",
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,

    shadowColor: "#123A7A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  companyCardSelected: {
    width: "48%",
    backgroundColor: "#123A7A",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#123A7A",

    shadowColor: "#123A7A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F8FBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  logoImage: {
    width: 42,
    height: 42,
  },

  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#123A7A",
  },

  companyName: {
    textAlign: "center",
    fontWeight: "700",
    color: "#172033",
    fontSize: 14,
  },

  companyNameSelected: {
    textAlign: "center",
    fontWeight: "800",
    color: "#FFFFFF",
    fontSize: 14,
  },

  notListedButton: {
    backgroundColor: "#EEF5FF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CFE0F7",
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
  },

  notListedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#123A7A",
  },

  notListedSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  modelContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  modelCard: {
    width: "48%",
    backgroundColor: "#F8FBFF",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCE7F5",
  },

  modelCardSelected: {
    width: "48%",
    backgroundColor: "#123A7A",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,

    shadowColor: "#123A7A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  modelImage: {
    width: 80,
    height: 52,
    marginBottom: 10,
  },

  modelName: {
    color: "#172033",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 6,
  },

  modelNameSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 6,
  },

  summaryBox: {
    backgroundColor: "#F8FBFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE7F5",
    marginBottom: 22,
  },

  summaryHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#123A7A",
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: 14,
    color: "#172033",
    fontWeight: "800",
  },

  continueButton: {
    backgroundColor: "#123A7A",
    minHeight: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,

    shadowColor: "#123A7A",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  backButton: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
