// Comprehensive Doctor Database for Jaipur
// 10 Specializations × 3 Doctors = 30 Total Doctors

export const DOCTORS_DATABASE = [
    // ============================================
    // PRIMARY CARE (General Physicians)
    // ============================================
    {
        id: "doc_pc_1",
        firebase_uid: "ubeNDRtpSwWcHQCOdjFb5KXd1bp1",
        name: "Dr. Rajesh Sharma",
        specialty: "Primary Care",
        qualification: "MBBS, MD (General Medicine)",
        experience: "18 years",
        rating: 4.7,
        reviews: 342,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 600,
        available_days: ["Mon", "Tue", "Wed", "Fri", "Sat"],
        timings: "9:00 AM - 5:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:00", "14:30"],
        image: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=0d9488&color=fff"
    },
    {
        id: "doc_pc_2",
        firebase_uid: "r99Cbl8NvlPeKpt7Q9LiCR1RX142",
        name: "Dr. Priya Verma",
        specialty: "Primary Care",
        qualification: "MBBS, MD (Internal Medicine)",
        experience: "12 years",
        rating: 4.8,
        reviews: 289,
        languages: ["Hindi", "English", "Rajasthani"],
        location: {
            hospital: "Manipal Hospital",
            address: "Sector 5, Vidyadhar Nagar, Jaipur",
            area: "Vidyadhar Nagar",
            distance: "4.1 km",
            coordinates: { lat: 26.9692, lng: 75.8217 }
        },
        consultation_fee: 550,
        available_days: ["Mon", "Wed", "Thu", "Fri", "Sat"],
        timings: "10:00 AM - 6:00 PM",
        next_available: "2026-01-03",
        today_slots: ["11:00", "15:30"],
        image: "https://ui-avatars.com/api/?name=Priya+Verma&background=0d9488&color=fff"
    },
    {
        id: "doc_pc_3",
        firebase_uid: "sKJ9BMB3WxOcsUz61gclmisy7p93",
        name: "Dr. Amit Gupta",
        specialty: "Primary Care",
        qualification: "MBBS, DNB (Family Medicine)",
        experience: "15 years",
        rating: 4.6,
        reviews: 412,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Eternal Heart Care Centre",
            address: "Jagatpura Road, Jagatpura, Jaipur",
            area: "Jagatpura",
            distance: "5.8 km",
            coordinates: { lat: 26.8434, lng: 75.8648 }
        },
        consultation_fee: 500,
        available_days: ["Tue", "Wed", "Thu", "Sat", "Sun"],
        timings: "8:00 AM - 4:00 PM",
        next_available: "2026-01-04",
        today_slots: ["09:30", "13:00"],
        image: "https://ui-avatars.com/api/?name=Amit+Gupta&background=0d9488&color=fff"
    },

    // ============================================
    // CARDIOLOGY (Heart Specialists)
    // ============================================
    {
        id: "doc_card_1",
        firebase_uid: "x996bh26a5YR3xoxNjjTFPikovn2",
        name: "Dr. Vikram Singh",
        specialty: "Cardiology",
        qualification: "MBBS, MD, DM (Cardiology)",
        experience: "20 years",
        rating: 4.9,
        reviews: 567,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Narayana Multispeciality Hospital",
            address: "Sector 28, Pratap Nagar, Jaipur",
            area: "Pratap Nagar",
            distance: "3.2 km",
            coordinates: { lat: 26.8721, lng: 75.7869 }
        },
        consultation_fee: 1200,
        available_days: ["Mon", "Wed", "Fri"],
        timings: "11:00 AM - 3:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "14:00"],
        image: "https://ui-avatars.com/api/?name=Vikram+Singh&background=ef4444&color=fff"
    },
    {
        id: "doc_card_2",
        firebase_uid: "rVjTT7VTGiRxBMURhhWvnZNjkGt2",
        name: "Dr. Sunita Agarwal",
        specialty: "Cardiology",
        qualification: "MBBS, MD, DM (Cardiology)",
        experience: "16 years",
        rating: 4.8,
        reviews: 423,
        languages: ["Hindi", "English"],
        location: {
            hospital: "SMS Hospital",
            address: "JLN Marg, Jaipur",
            area: "JLN Marg",
            distance: "1.8 km",
            coordinates: { lat: 26.9124, lng: 75.7873 }
        },
        consultation_fee: 800,
        available_days: ["Tue", "Thu", "Sat"],
        timings: "10:00 AM - 2:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:30", "13:00"],
        image: "https://ui-avatars.com/api/?name=Sunita+Agarwal&background=ef4444&color=fff"
    },
    {
        id: "doc_card_3",
        firebase_uid: "dw5WP2bcjpYOf6UWZIc0yHZegWH3",
        name: "Dr. Arjun Mehta",
        specialty: "Cardiology",
        qualification: "MBBS, MD, DM (Interventional Cardiology)",
        experience: "14 years",
        rating: 4.7,
        reviews: 389,
        languages: ["Hindi", "English", "Gujarati"],
        location: {
            hospital: "CK Birla Hospital",
            address: "Tonk Road, Jaipur",
            area: "Tonk Road",
            distance: "6.5 km",
            coordinates: { lat: 26.8467, lng: 75.8056 }
        },
        consultation_fee: 1000,
        available_days: ["Mon", "Tue", "Thu", "Fri"],
        timings: "9:00 AM - 1:00 PM",
        next_available: "2026-01-03",
        today_slots: ["09:00", "12:00"],
        image: "https://ui-avatars.com/api/?name=Arjun+Mehta&background=ef4444&color=fff"
    },

    // ============================================
    // DERMATOLOGY (Skin Specialists)
    // ============================================
    {
        id: "doc_derm_1",
        firebase_uid: "0RPcg20rdWYEZ8R6k7W6B9HPhPn2",
        name: "Dr. Neha Jain",
        specialty: "Dermatology",
        qualification: "MBBS, MD (Dermatology)",
        experience: "10 years",
        rating: 4.8,
        reviews: 512,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Skin & You Clinic",
            address: "C-Scheme, Jaipur",
            area: "C-Scheme",
            distance: "2.7 km",
            coordinates: { lat: 26.9124, lng: 75.7873 }
        },
        consultation_fee: 700,
        available_days: ["Mon", "Wed", "Thu", "Fri", "Sat"],
        timings: "11:00 AM - 7:00 PM",
        next_available: "2026-01-03",
        today_slots: ["12:00", "16:00"],
        image: "https://ui-avatars.com/api/?name=Neha+Jain&background=f59e0b&color=fff"
    },
    {
        id: "doc_derm_2",
        firebase_uid: "e5Be8uRKumUMAbJZn32sCQpHGy63",
        name: "Dr. Karan Malhotra",
        specialty: "Dermatology",
        qualification: "MBBS, MD, DNB (Dermatology)",
        experience: "13 years",
        rating: 4.7,
        reviews: 445,
        languages: ["Hindi", "English", "Punjabi"],
        location: {
            hospital: "Apex Hospital",
            address: "Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "3.5 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 650,
        available_days: ["Tue", "Wed", "Fri", "Sat"],
        timings: "10:00 AM - 6:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "15:00"],
        image: "https://ui-avatars.com/api/?name=Karan+Malhotra&background=f59e0b&color=fff"
    },
    {
        id: "doc_derm_3",
        firebase_uid: "bMWXQKNEmwUP8dlIEQlWxISyHKg2",
        name: "Dr. Anjali Saxena",
        specialty: "Dermatology",
        qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
        experience: "11 years",
        rating: 4.9,
        reviews: 623,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Jaipur Skin Hospital",
            address: "Vaishali Nagar, Jaipur",
            area: "Vaishali Nagar",
            distance: "4.9 km",
            coordinates: { lat: 26.9154, lng: 75.7258 }
        },
        consultation_fee: 750,
        available_days: ["Mon", "Tue", "Thu", "Sat", "Sun"],
        timings: "9:00 AM - 5:00 PM",
        next_available: "2026-01-03",
        today_slots: ["10:00", "14:30"],
        image: "https://ui-avatars.com/api/?name=Anjali+Saxena&background=f59e0b&color=fff"
    },

    // ============================================
    // ORTHOPEDICS (Bone & Joint Specialists)
    // ============================================
    {
        id: "doc_ortho_1",
        firebase_uid: "aVDizPiBfFgijZ3S5k2BxzERmZ12",
        name: "Dr. Rahul Khanna",
        specialty: "Orthopedics",
        qualification: "MBBS, MS (Orthopedics)",
        experience: "17 years",
        rating: 4.8,
        reviews: 478,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Jaipur Joint Replacement Centre",
            address: "Tonk Road, Jaipur",
            area: "Tonk Road",
            distance: "5.2 km",
            coordinates: { lat: 26.8467, lng: 75.8056 }
        },
        consultation_fee: 900,
        available_days: ["Mon", "Wed", "Fri", "Sat"],
        timings: "10:00 AM - 4:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:30", "14:00"],
        image: "https://ui-avatars.com/api/?name=Rahul+Khanna&background=3b82f6&color=fff"
    },
    {
        id: "doc_ortho_2",
        firebase_uid: "80R1XNAZZUSYP69lYYHvd7wg1DB3",
        name: "Dr. Meera Reddy",
        specialty: "Orthopedics",
        qualification: "MBBS, MS, DNB (Orthopedics)",
        experience: "14 years",
        rating: 4.7,
        reviews: 392,
        languages: ["Hindi", "English", "Telugu"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 850,
        available_days: ["Tue", "Thu", "Sat"],
        timings: "11:00 AM - 5:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "15:30"],
        image: "https://ui-avatars.com/api/?name=Meera+Reddy&background=3b82f6&color=fff"
    },
    {
        id: "doc_ortho_3",
        firebase_uid: "jpZMCunAhQgrap86hk2VKDsyQPh1",
        name: "Dr. Sandeep Patel",
        specialty: "Orthopedics",
        qualification: "MBBS, MS (Orthopedics), Fellowship in Sports Medicine",
        experience: "12 years",
        rating: 4.6,
        reviews: 356,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Manipal Hospital",
            address: "Sector 5, Vidyadhar Nagar, Jaipur",
            area: "Vidyadhar Nagar",
            distance: "4.1 km",
            coordinates: { lat: 26.9692, lng: 75.8217 }
        },
        consultation_fee: 800,
        available_days: ["Mon", "Tue", "Wed", "Fri"],
        timings: "9:00 AM - 3:00 PM",
        next_available: "2026-01-03",
        today_slots: ["09:30", "13:30"],
        image: "https://ui-avatars.com/api/?name=Sandeep+Patel&background=3b82f6&color=fff"
    },

    // ============================================
    // PEDIATRICS (Child Specialists)
    // ============================================
    {
        id: "doc_ped_1",
        firebase_uid: "xG1tDUGLNBUPE191sPJonuaFPqS2",
        name: "Dr. Kavita Sharma",
        specialty: "Pediatrics",
        qualification: "MBBS, MD (Pediatrics)",
        experience: "16 years",
        rating: 4.9,
        reviews: 689,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Rainbow Children's Hospital",
            address: "Vaishali Nagar, Jaipur",
            area: "Vaishali Nagar",
            distance: "4.9 km",
            coordinates: { lat: 26.9154, lng: 75.7258 }
        },
        consultation_fee: 600,
        available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        timings: "10:00 AM - 6:00 PM",
        next_available: "2026-01-03",
        today_slots: ["11:00", "15:00"],
        image: "https://ui-avatars.com/api/?name=Kavita+Sharma&background=8b5cf6&color=fff"
    },
    {
        id: "doc_ped_2",
        firebase_uid: "9N1T6jsEEzTu4Qj2h9AnRmN1e5L2",
        name: "Dr. Rohit Bansal",
        specialty: "Pediatrics",
        qualification: "MBBS, MD, DNB (Pediatrics)",
        experience: "13 years",
        rating: 4.8,
        reviews: 534,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Narayana Multispeciality Hospital",
            address: "Sector 28, Pratap Nagar, Jaipur",
            area: "Pratap Nagar",
            distance: "3.2 km",
            coordinates: { lat: 26.8721, lng: 75.7869 }
        },
        consultation_fee: 550,
        available_days: ["Mon", "Wed", "Thu", "Sat", "Sun"],
        timings: "9:00 AM - 5:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:00", "14:00"],
        image: "https://ui-avatars.com/api/?name=Rohit+Bansal&background=8b5cf6&color=fff"
    },
    {
        id: "doc_ped_3",
        firebase_uid: "6BbgGSwdN4WiFdYM1hQrhx3gnEb2",
        name: "Dr. Pooja Agarwal",
        specialty: "Pediatrics",
        qualification: "MBBS, MD (Pediatrics), Fellowship in Neonatology",
        experience: "11 years",
        rating: 4.7,
        reviews: 467,
        languages: ["Hindi", "English"],
        location: {
            hospital: "CK Birla Hospital",
            address: "Tonk Road, Jaipur",
            area: "Tonk Road",
            distance: "6.5 km",
            coordinates: { lat: 26.8467, lng: 75.8056 }
        },
        consultation_fee: 650,
        available_days: ["Tue", "Wed", "Fri", "Sat"],
        timings: "11:00 AM - 7:00 PM",
        next_available: "2026-01-03",
        today_slots: ["12:00", "16:30"],
        image: "https://ui-avatars.com/api/?name=Pooja+Agarwal&background=8b5cf6&color=fff"
    },

    // ============================================
    // GYNECOLOGY (Women's Health)
    // ============================================
    {
        id: "doc_gyn_1",
        firebase_uid: "LvQSBSkDZDa8tT46lqe8D4kdPs93",
        name: "Dr. Nisha Kapoor",
        specialty: "Gynecology",
        qualification: "MBBS, MS (Obstetrics & Gynecology)",
        experience: "19 years",
        rating: 4.9,
        reviews: 712,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 800,
        available_days: ["Mon", "Tue", "Wed", "Fri", "Sat"],
        timings: "10:00 AM - 6:00 PM",
        next_available: "2026-01-03",
        today_slots: ["11:00", "15:00"],
        image: "https://ui-avatars.com/api/?name=Nisha+Kapoor&background=ec4899&color=fff"
    },
    {
        id: "doc_gyn_2",
        firebase_uid: "iMJk3n2zDzeEZkEyosOg8AzNMYm1",
        name: "Dr. Rekha Singhania",
        specialty: "Gynecology",
        qualification: "MBBS, MD (Obstetrics & Gynecology), FICOG",
        experience: "15 years",
        rating: 4.8,
        reviews: 598,
        languages: ["Hindi", "English", "Marwari"],
        location: {
            hospital: "Apex Hospital",
            address: "Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "3.5 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 750,
        available_days: ["Mon", "Wed", "Thu", "Sat"],
        timings: "11:00 AM - 7:00 PM",
        next_available: "2026-01-04",
        today_slots: ["12:00", "16:00"],
        image: "https://ui-avatars.com/api/?name=Rekha+Singhania&background=ec4899&color=fff"
    },
    {
        id: "doc_gyn_3",
        firebase_uid: "h2WW8oABaCUR3M6n1jcPqY4VOtA2",
        name: "Dr. Simran Bhatia",
        specialty: "Gynecology",
        qualification: "MBBS, MS (Obstetrics & Gynecology), DNB",
        experience: "12 years",
        rating: 4.7,
        reviews: 523,
        languages: ["Hindi", "English", "Punjabi"],
        location: {
            hospital: "Manipal Hospital",
            address: "Sector 5, Vidyadhar Nagar, Jaipur",
            area: "Vidyadhar Nagar",
            distance: "4.1 km",
            coordinates: { lat: 26.9692, lng: 75.8217 }
        },
        consultation_fee: 700,
        available_days: ["Tue", "Thu", "Fri", "Sat", "Sun"],
        timings: "9:00 AM - 5:00 PM",
        next_available: "2026-01-03",
        today_slots: ["10:30", "14:30"],
        image: "https://ui-avatars.com/api/?name=Simran+Bhatia&background=ec4899&color=fff"
    },

    // ============================================
    // ENT (Ear, Nose, Throat)
    // ============================================
    {
        id: "doc_ent_1",
        firebase_uid: "EYXoafVaTiMMnUZ8BPDWBlv73oC2",
        name: "Dr. Anil Kumar",
        specialty: "ENT",
        qualification: "MBBS, MS (ENT)",
        experience: "18 years",
        rating: 4.8,
        reviews: 456,
        languages: ["Hindi", "English"],
        location: {
            hospital: "SMS Hospital",
            address: "JLN Marg, Jaipur",
            area: "JLN Marg",
            distance: "1.8 km",
            coordinates: { lat: 26.9124, lng: 75.7873 }
        },
        consultation_fee: 600,
        available_days: ["Mon", "Wed", "Fri", "Sat"],
        timings: "10:00 AM - 4:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:30", "14:00"],
        image: "https://ui-avatars.com/api/?name=Anil+Kumar&background=14b8a6&color=fff"
    },
    {
        id: "doc_ent_2",
        firebase_uid: "hGZyJ3VUpWOfRuBXV9uJ9Agb7BD3",
        name: "Dr. Shalini Gupta",
        specialty: "ENT",
        qualification: "MBBS, MS, DNB (ENT)",
        experience: "14 years",
        rating: 4.7,
        reviews: 389,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Narayana Multispeciality Hospital",
            address: "Sector 28, Pratap Nagar, Jaipur",
            area: "Pratap Nagar",
            distance: "3.2 km",
            coordinates: { lat: 26.8721, lng: 75.7869 }
        },
        consultation_fee: 650,
        available_days: ["Tue", "Thu", "Sat"],
        timings: "11:00 AM - 5:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "15:00"],
        image: "https://ui-avatars.com/api/?name=Shalini+Gupta&background=14b8a6&color=fff"
    },
    {
        id: "doc_ent_3",
        firebase_uid: "AuVA9zfB82fY9axGEZ3ftZonRWG2",
        name: "Dr. Manish Joshi",
        specialty: "ENT",
        qualification: "MBBS, MS (ENT), Fellowship in Rhinology",
        experience: "11 years",
        rating: 4.6,
        reviews: 334,
        languages: ["Hindi", "English"],
        location: {
            hospital: "CK Birla Hospital",
            address: "Tonk Road, Jaipur",
            area: "Tonk Road",
            distance: "6.5 km",
            coordinates: { lat: 26.8467, lng: 75.8056 }
        },
        consultation_fee: 700,
        available_days: ["Mon", "Tue", "Wed", "Fri"],
        timings: "9:00 AM - 3:00 PM",
        next_available: "2026-01-03",
        today_slots: ["09:30", "13:00"],
        image: "https://ui-avatars.com/api/?name=Manish+Joshi&background=14b8a6&color=fff"
    },

    // ============================================
    // OPHTHALMOLOGY (Eye Specialists)
    // ============================================
    {
        id: "doc_oph_1",
        firebase_uid: "Q3vICT5829Zu1vJ3DBLdiY3VsXG3",
        name: "Dr. Deepak Verma",
        specialty: "Ophthalmology",
        qualification: "MBBS, MS (Ophthalmology)",
        experience: "16 years",
        rating: 4.9,
        reviews: 623,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Jaipur Eye Hospital",
            address: "C-Scheme, Jaipur",
            area: "C-Scheme",
            distance: "2.7 km",
            coordinates: { lat: 26.9124, lng: 75.7873 }
        },
        consultation_fee: 700,
        available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        timings: "10:00 AM - 6:00 PM",
        next_available: "2026-01-03",
        today_slots: ["11:00", "15:30"],
        image: "https://ui-avatars.com/api/?name=Deepak+Verma&background=06b6d4&color=fff"
    },
    {
        id: "doc_oph_2",
        firebase_uid: "OQrOk1W3MVhQJ4KadQUntArgCgi2",
        name: "Dr. Ritu Malhotra",
        specialty: "Ophthalmology",
        qualification: "MBBS, MS, DNB (Ophthalmology)",
        experience: "13 years",
        rating: 4.8,
        reviews: 512,
        languages: ["Hindi", "English", "Punjabi"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 750,
        available_days: ["Mon", "Wed", "Fri", "Sat"],
        timings: "11:00 AM - 7:00 PM",
        next_available: "2026-01-04",
        today_slots: ["12:00", "16:00"],
        image: "https://ui-avatars.com/api/?name=Ritu+Malhotra&background=06b6d4&color=fff"
    },
    {
        id: "doc_oph_3",
        firebase_uid: "zzJkDXcsvSRP9UgDJbf6K80ECuW2",
        name: "Dr. Suresh Reddy",
        specialty: "Ophthalmology",
        qualification: "MBBS, MS (Ophthalmology), Fellowship in Retina",
        experience: "10 years",
        rating: 4.7,
        reviews: 445,
        languages: ["Hindi", "English", "Telugu"],
        location: {
            hospital: "Manipal Hospital",
            address: "Sector 5, Vidyadhar Nagar, Jaipur",
            area: "Vidyadhar Nagar",
            distance: "4.1 km",
            coordinates: { lat: 26.9692, lng: 75.8217 }
        },
        consultation_fee: 650,
        available_days: ["Tue", "Thu", "Sat", "Sun"],
        timings: "9:00 AM - 5:00 PM",
        next_available: "2026-01-03",
        today_slots: ["10:00", "14:00"],
        image: "https://ui-avatars.com/api/?name=Suresh+Reddy&background=06b6d4&color=fff"
    },

    // ============================================
    // GASTROENTEROLOGY (Digestive System)
    // ============================================
    {
        id: "doc_gastro_1",
        firebase_uid: "TOoAB7FKtmciE3n9Jt8CtR6eZnz1",
        name: "Dr. Ashok Jain",
        specialty: "Gastroenterology",
        qualification: "MBBS, MD, DM (Gastroenterology)",
        experience: "17 years",
        rating: 4.8,
        reviews: 478,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Narayana Multispeciality Hospital",
            address: "Sector 28, Pratap Nagar, Jaipur",
            area: "Pratap Nagar",
            distance: "3.2 km",
            coordinates: { lat: 26.8721, lng: 75.7869 }
        },
        consultation_fee: 1000,
        available_days: ["Mon", "Wed", "Fri"],
        timings: "10:00 AM - 2:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:30", "13:00"],
        image: "https://ui-avatars.com/api/?name=Ashok+Jain&background=10b981&color=fff"
    },
    {
        id: "doc_gastro_2",
        firebase_uid: "755W4y9pAXc7QDdIeWvVgIHQYUR2",
        name: "Dr. Vandana Sharma",
        specialty: "Gastroenterology",
        qualification: "MBBS, MD, DM (Gastroenterology & Hepatology)",
        experience: "14 years",
        rating: 4.7,
        reviews: 392,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 950,
        available_days: ["Tue", "Thu", "Sat"],
        timings: "11:00 AM - 3:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "14:30"],
        image: "https://ui-avatars.com/api/?name=Vandana+Sharma&background=10b981&color=fff"
    },
    {
        id: "doc_gastro_3",
        firebase_uid: "QpYAqFF2UQbWNpiIs3TsP0gJh8X2",
        name: "Dr. Ramesh Patel",
        specialty: "Gastroenterology",
        qualification: "MBBS, MD, DM (Gastroenterology)",
        experience: "12 years",
        rating: 4.6,
        reviews: 356,
        languages: ["Hindi", "English", "Gujarati"],
        location: {
            hospital: "CK Birla Hospital",
            address: "Tonk Road, Jaipur",
            area: "Tonk Road",
            distance: "6.5 km",
            coordinates: { lat: 26.8467, lng: 75.8056 }
        },
        consultation_fee: 900,
        available_days: ["Mon", "Tue", "Wed", "Fri"],
        timings: "9:00 AM - 1:00 PM",
        next_available: "2026-01-03",
        today_slots: ["09:30", "12:30"],
        image: "https://ui-avatars.com/api/?name=Ramesh+Patel&background=10b981&color=fff"
    },

    // ============================================
    // NEUROLOGY (Brain & Nervous System)
    // ============================================
    {
        id: "doc_neuro_1",
        firebase_uid: "htbIdCgQTugaAsLWHMZzyV5jg9l1",
        name: "Dr. Sanjay Khanna",
        specialty: "Neurology",
        qualification: "MBBS, MD, DM (Neurology)",
        experience: "19 years",
        rating: 4.9,
        reviews: 567,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Fortis Escorts Hospital",
            address: "Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur",
            area: "Malviya Nagar",
            distance: "2.3 km",
            coordinates: { lat: 26.8518, lng: 75.8129 }
        },
        consultation_fee: 1200,
        available_days: ["Mon", "Wed", "Fri"],
        timings: "11:00 AM - 3:00 PM",
        next_available: "2026-01-04",
        today_slots: ["11:30", "14:00"],
        image: "https://ui-avatars.com/api/?name=Sanjay+Khanna&background=6366f1&color=fff"
    },
    {
        id: "doc_neuro_2",
        firebase_uid: "yeqa4zwAv5hSduuJi9UffsGkDtS2",
        name: "Dr. Anita Desai",
        specialty: "Neurology",
        qualification: "MBBS, MD, DM (Neurology & Stroke Medicine)",
        experience: "15 years",
        rating: 4.8,
        reviews: 489,
        languages: ["Hindi", "English", "Marathi"],
        location: {
            hospital: "Narayana Multispeciality Hospital",
            address: "Sector 28, Pratap Nagar, Jaipur",
            area: "Pratap Nagar",
            distance: "3.2 km",
            coordinates: { lat: 26.8721, lng: 75.7869 }
        },
        consultation_fee: 1100,
        available_days: ["Tue", "Thu", "Sat"],
        timings: "10:00 AM - 2:00 PM",
        next_available: "2026-01-04",
        today_slots: ["10:30", "13:30"],
        image: "https://ui-avatars.com/api/?name=Anita+Desai&background=6366f1&color=fff"
    },
    {
        id: "doc_neuro_3",
        firebase_uid: "0JEMsylm69R1yBZd6r20vIwlzMd2",
        name: "Dr. Vikrant Singh",
        specialty: "Neurology",
        qualification: "MBBS, MD, DM (Neurology), Fellowship in Epilepsy",
        experience: "13 years",
        rating: 4.7,
        reviews: 423,
        languages: ["Hindi", "English"],
        location: {
            hospital: "Manipal Hospital",
            address: "Sector 5, Vidyadhar Nagar, Jaipur",
            area: "Vidyadhar Nagar",
            distance: "4.1 km",
            coordinates: { lat: 26.9692, lng: 75.8217 }
        },
        consultation_fee: 1050,
        available_days: ["Mon", "Tue", "Thu", "Fri"],
        timings: "9:00 AM - 1:00 PM",
        next_available: "2026-01-03",
        today_slots: ["09:30", "12:00"],
        image: "https://ui-avatars.com/api/?name=Vikrant+Singh&background=6366f1&color=fff"
    }
];

// Helper function to get doctors by specialty
export const getDoctorsBySpecialty = (specialty) => {
    return DOCTORS_DATABASE.filter(doc => doc.specialty === specialty);
};

// Helper function to get all specialties
export const getAllSpecialties = () => {
    return [...new Set(DOCTORS_DATABASE.map(doc => doc.specialty))];
};

// Helper function to get doctors sorted by distance
export const getDoctorsByDistance = () => {
    return [...DOCTORS_DATABASE].sort((a, b) => {
        const distA = parseFloat(a.location.distance);
        const distB = parseFloat(b.location.distance);
        return distA - distB;
    });
};

// Helper function to get doctors by area
export const getDoctorsByArea = (area) => {
    return DOCTORS_DATABASE.filter(doc => doc.location.area === area);
};
