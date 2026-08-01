export const hospitals = [
    {
        id: 1,
        name: "CyberMed General Hospital",
        location: "Neo-Tokyo District",
        rating: 4.8,
        distance: "1.2 km",
        services: [
            { name: "MRI Scan", price: 150, originalPrice: 250 },
            { name: "General Checkup", price: 50, originalPrice: 80 }
        ],
        verified: true
    },
    {
        id: 2,
        name: "BioHealth Diagnostics",
        location: "Sector 7",
        rating: 4.5,
        distance: "3.5 km",
        services: [
            { name: "MRI Scan", price: 180, originalPrice: 300 },
            { name: "X-Ray", price: 40, originalPrice: 60 }
        ],
        verified: true
    },
    {
        id: 3,
        name: "FutureCare Clinic",
        location: "Downtown Core",
        rating: 4.9,
        distance: "0.8 km",
        services: [
            { name: "General Checkup", price: 45, originalPrice: 100 },
            { name: "Blood Test", price: 20, originalPrice: 35 }
        ],
        verified: false
    },
    {
        id: 4,
        name: "Quantum Medical Center",
        location: "Tech Hub",
        rating: 4.7,
        distance: "5.0 km",
        services: [
            { name: "CT Scan", price: 220, originalPrice: 400 },
            { name: "MRI Scan", price: 160, originalPrice: 280 }
        ],
        verified: true
    }
];
