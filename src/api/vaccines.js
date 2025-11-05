import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test-mediconnect.vercel.app/api';

// Demo mode for testing - will auto-fallback to demo data if API returns empty
const DEMO_MODE = false; // Set to false when API is ready
const AUTO_FALLBACK = true; // Automatically use demo data if API returns empty results

// Mock vaccine data for demo
const MOCK_VACCINES = [
    {
        id: 'vaccine-1',
        name: 'COVID-19 mRNA Vaccine',
        brand: 'Pfizer-BioNTech',
        category: 'viral',
        description: 'mRNA vaccine for COVID-19 prevention',
        age_groups: ['adult', 'adolescent'],
        doses_required: 2,
        interval_between_doses: '21 days',
        booster_required: true,
        booster_interval: '6 months',
        side_effects: ['pain at injection site', 'fatigue', 'headache'],
        contraindications: ['severe allergic reaction'],
        is_required: true,
        availability: 'widely_available',
        cost: 0,
        efficacy_rate: 95,
        protection_duration: '6-12 months',
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'vaccine-2',
        name: 'Hepatitis B Vaccine',
        brand: 'Engerix-B',
        category: 'viral',
        description: 'Vaccine to prevent Hepatitis B infection',
        age_groups: ['infant', 'child', 'adolescent', 'adult'],
        doses_required: 3,
        interval_between_doses: '1 month minimum',
        booster_required: false,
        side_effects: ['soreness at injection site', 'low-grade fever', 'fatigue'],
        contraindications: ['severe illness', 'yeast allergy'],
        is_required: true,
        availability: 'widely_available',
        cost: 25.50,
        efficacy_rate: 95,
        protection_duration: 'lifetime',
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'vaccine-3',
        name: 'Influenza Vaccine',
        brand: 'FluMist',
        category: 'seasonal',
        description: 'Annual flu vaccine for seasonal protection',
        age_groups: ['child', 'adolescent', 'adult', 'elderly'],
        doses_required: 1,
        interval_between_doses: 'N/A',
        booster_required: true,
        booster_interval: '1 year',
        side_effects: ['mild soreness', 'low fever'],
        contraindications: ['egg allergy', 'severe illness'],
        is_required: false,
        availability: 'seasonal',
        cost: 15.00,
        efficacy_rate: 60,
        protection_duration: '1 year',
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'vaccine-4',
        name: 'MMR Vaccine',
        brand: 'M-M-R II',
        category: 'viral',
        description: 'Combined vaccine for Measles, Mumps, and Rubella',
        age_groups: ['infant', 'child', 'adolescent'],
        doses_required: 2,
        interval_between_doses: '4 weeks minimum',
        booster_required: false,
        side_effects: ['fever', 'mild rash', 'swollen glands'],
        contraindications: ['pregnancy', 'immunocompromised'],
        is_required: true,
        availability: 'widely_available',
        cost: 30.00,
        efficacy_rate: 97,
        protection_duration: 'lifetime',
        created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'vaccine-5',
        name: 'Travel Typhoid Vaccine',
        brand: 'Typhim Vi',
        category: 'travel',
        description: 'Vaccine for travelers to typhoid endemic areas',
        age_groups: ['adolescent', 'adult'],
        doses_required: 1,
        interval_between_doses: 'N/A',
        booster_required: true,
        booster_interval: '3 years',
        side_effects: ['injection site pain', 'headache'],
        contraindications: ['acute illness'],
        is_required: false,
        availability: 'travel_clinics',
        cost: 85.00,
        efficacy_rate: 70,
        protection_duration: '3 years',
        created_at: '2025-01-15T10:00:00Z'
    }
];

class VaccineService {
    constructor() {
        this.authToken = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            this.authToken = await AsyncStorage.getItem('@mediconnect_user_token');
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
            'Content-Type': 'application/json',
        };
    }

    // Get all vaccines with filtering and pagination
    async getAllVaccines(params = {}) {
        try {
            await this.initializeAuth(); // Ensure auth token is loaded
            
            const {
                page = 1,
                limit = 10,
                search = '',
                category = '',
                age_group = '',
                required = ''
            } = params;

            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Filter mock data based on search parameters
                let filteredVaccines = [...MOCK_VACCINES];

                if (search) {
                    filteredVaccines = filteredVaccines.filter(vaccine =>
                        vaccine.name.toLowerCase().includes(search.toLowerCase()) ||
                        vaccine.brand.toLowerCase().includes(search.toLowerCase()) ||
                        vaccine.description.toLowerCase().includes(search.toLowerCase())
                    );
                }

                if (category) {
                    filteredVaccines = filteredVaccines.filter(vaccine =>
                        vaccine.category.toLowerCase() === category.toLowerCase()
                    );
                }

                if (age_group) {
                    filteredVaccines = filteredVaccines.filter(vaccine =>
                        vaccine.age_groups.includes(age_group.toLowerCase())
                    );
                }

                if (required !== '') {
                    const isRequired = required === 'true';
                    filteredVaccines = filteredVaccines.filter(vaccine =>
                        vaccine.is_required === isRequired
                    );
                }

                // Pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedVaccines = filteredVaccines.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: {
                        vaccines: paginatedVaccines,
                        total: filteredVaccines.length,
                        page: page,
                        limit: limit,
                        total_pages: Math.ceil(filteredVaccines.length / limit)
                    },
                    message: 'Vaccines retrieved successfully'
                };
            }            // Real API call
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && search.trim() !== '' && { search }),
                ...(category && category.trim() !== '' && { category }),
                ...(age_group && age_group.trim() !== '' && { age_group }),
                ...(required !== '' && required !== null && required !== undefined && { required })
            });

            console.log('Fetching vaccines with params:', queryParams.toString());
            console.log('Using auth token:', this.authToken ? 'Token present' : 'No token');
            
            const response = await fetch(`${API_BASE_URL}/vaccines?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
              const data = await response.json();
            console.log('Vaccines API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to fetch vaccines`;
                console.error('API Error:', errorMessage);
                throw new Error(errorMessage);
            }            // Handle API response structure - adapt to your actual API
            if (data.success && data.data) {
                const vaccines = data.data.vaccines || [];
                
                // If no vaccines found and AUTO_FALLBACK is enabled, use demo data
                if (vaccines.length === 0 && AUTO_FALLBACK) {
                    console.log('No vaccines from API, using demo data as fallback');
                    
                    // Apply filters to demo data
                    let filteredVaccines = [...MOCK_VACCINES];
                    
                    if (search) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.name.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.brand.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.description.toLowerCase().includes(search.toLowerCase())
                        );
                    }

                    if (category) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.category.toLowerCase() === category.toLowerCase()
                        );
                    }

                    if (age_group) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.age_groups.includes(age_group.toLowerCase())
                        );
                    }

                    if (required !== '' && required !== null && required !== undefined) {
                        const isRequired = required === 'true' || required === true;
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.is_required === isRequired
                        );
                    }

                    // Pagination for demo data
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedVaccines = filteredVaccines.slice(startIndex, endIndex);

                    return {
                        success: true,
                        data: {
                            vaccines: paginatedVaccines,
                            total: filteredVaccines.length,
                            page: page,
                            limit: limit,
                            total_pages: Math.ceil(filteredVaccines.length / limit)
                        },
                        message: 'Vaccines retrieved successfully (demo data)'
                    };
                }
                
                return data;            } else if (data.vaccines) {
                // Handle direct vaccines array response
                const vaccines = Array.isArray(data.vaccines) ? data.vaccines : [];
                
                // If no vaccines found and AUTO_FALLBACK is enabled, use demo data
                if (vaccines.length === 0 && AUTO_FALLBACK) {
                    console.log('No vaccines from direct API response, using demo data as fallback');
                    
                    // Apply filters to demo data
                    let filteredVaccines = [...MOCK_VACCINES];
                    
                    if (search) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.name.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.brand.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.description.toLowerCase().includes(search.toLowerCase())
                        );
                    }

                    if (category) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.category.toLowerCase() === category.toLowerCase()
                        );
                    }

                    if (age_group) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.age_groups.includes(age_group.toLowerCase())
                        );
                    }

                    if (required !== '' && required !== null && required !== undefined) {
                        const isRequired = required === 'true' || required === true;
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.is_required === isRequired
                        );
                    }

                    // Pagination for demo data
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedVaccines = filteredVaccines.slice(startIndex, endIndex);

                    return {
                        success: true,
                        data: {
                            vaccines: paginatedVaccines,
                            total: filteredVaccines.length,
                            page: page,
                            limit: limit,
                            total_pages: Math.ceil(filteredVaccines.length / limit)
                        },
                        message: 'Vaccines retrieved successfully (demo data fallback)'
                    };
                }
                
                return {
                    success: true,
                    data: {
                        vaccines: vaccines,
                        total: data.count || vaccines.length || 0,
                        page: page,
                        limit: limit,
                        total_pages: Math.ceil((data.count || vaccines.length || 0) / limit)
                    },
                    message: 'Vaccines retrieved successfully'
                };            } else {
                // Handle empty response
                console.log('No vaccines found or empty response');
                
                // If AUTO_FALLBACK is enabled and no data found, use demo data
                if (AUTO_FALLBACK) {
                    console.log('Using demo data as fallback for empty response');
                    
                    // Apply filters to demo data
                    let filteredVaccines = [...MOCK_VACCINES];
                    
                    if (search) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.name.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.brand.toLowerCase().includes(search.toLowerCase()) ||
                            vaccine.description.toLowerCase().includes(search.toLowerCase())
                        );
                    }

                    if (category) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.category.toLowerCase() === category.toLowerCase()
                        );
                    }

                    if (age_group) {
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.age_groups.includes(age_group.toLowerCase())
                        );
                    }

                    if (required !== '' && required !== null && required !== undefined) {
                        const isRequired = required === 'true' || required === true;
                        filteredVaccines = filteredVaccines.filter(vaccine =>
                            vaccine.is_required === isRequired
                        );
                    }

                    // Pagination for demo data
                    const startIndex = (page - 1) * limit;
                    const endIndex = startIndex + limit;
                    const paginatedVaccines = filteredVaccines.slice(startIndex, endIndex);

                    return {
                        success: true,
                        data: {
                            vaccines: paginatedVaccines,
                            total: filteredVaccines.length,
                            page: page,
                            limit: limit,
                            total_pages: Math.ceil(filteredVaccines.length / limit)
                        },
                        message: 'Vaccines retrieved successfully (demo fallback)'
                    };
                }
                
                // Return empty but successful result
                return {
                    success: true,
                    data: {
                        vaccines: [],
                        total: 0,
                        page: 1,
                        limit: limit,
                        total_pages: 0
                    },
                    message: 'No vaccines found in database'
                };
            }
        } catch (error) {
            console.error('Get vaccines error:', error);
            
            // Handle different types of errors
            if (error.message.includes('fetch') || error.message.includes('Network')) {
                return {
                    success: false,
                    message: 'Network error. Please check your internet connection and try again.',
                };
            }
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return {
                    success: false,
                    message: 'Authentication required. Please login again.',
                };
            }
            
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccines. Please try again.',
            };
        }
    }

    // Get vaccine by ID
    async getVaccineById(vaccineId) {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const vaccine = MOCK_VACCINES.find(v => v.id === vaccineId);

                if (!vaccine) {
                    throw new Error('Vaccine not found');
                }

                // Extended vaccine details for single vaccine view
                const extendedVaccine = {
                    ...vaccine,
                    dose_schedule: vaccine.doses_required > 1 ? 
                        ['birth', '1-2 months', '6-18 months'].slice(0, vaccine.doses_required) : 
                        ['single dose'],
                    precautions: ['moderate illness', 'pregnancy consultation'],
                    storage_requirements: '2-8°C',
                    manufacturer: 'Various',
                    approval_date: '2020-12-11'
                };

                return {
                    success: true,
                    data: {
                        vaccine: extendedVaccine
                    },
                    message: 'Vaccine details retrieved successfully'
                };
            }

            // Real API call
            const response = await fetch(`${API_BASE_URL}/vaccines/${vaccineId}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccine details');
            }

            return data;
        } catch (error) {
            console.error('Get vaccine by ID error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccine details',
            };
        }
    }

    // Get vaccines by age group
    async getVaccinesByAgeGroup(ageGroup, params = {}) {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const ageGroupVaccines = MOCK_VACCINES.filter(vaccine =>
                    vaccine.age_groups.includes(ageGroup.toLowerCase())
                );

                return {
                    success: true,
                    data: {
                        vaccines: ageGroupVaccines,
                        total: ageGroupVaccines.length,
                        age_group: ageGroup
                    },
                    message: `Vaccines for ${ageGroup} age group retrieved successfully`
                };
            }

            // Real API call
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${API_BASE_URL}/vaccines/age-group/${ageGroup}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccines by age group');
            }

            return data;
        } catch (error) {
            console.error('Get vaccines by age group error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccines by age group',
            };
        }
    }

    // Get vaccines by category
    async getVaccinesByCategory(category, params = {}) {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const categoryVaccines = MOCK_VACCINES.filter(vaccine =>
                    vaccine.category.toLowerCase() === category.toLowerCase()
                );

                return {
                    success: true,
                    data: {
                        vaccines: categoryVaccines,
                        total: categoryVaccines.length,
                        category: category
                    },
                    message: `${category} vaccines retrieved successfully`
                };
            }

            // Real API call
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${API_BASE_URL}/vaccines/category/${category}?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccines by category');
            }

            return data;
        } catch (error) {
            console.error('Get vaccines by category error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccines by category',
            };
        }
    }

    // Get vaccination schedule
    async getVaccinationSchedule(params = {}) {
        try {
            const { age_group = 'infant', country = 'US' } = params;

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 700));

                const mockSchedule = {
                    age_group: age_group,
                    country: country,
                    vaccinations: [
                        {
                            age: 'birth',
                            vaccines: [
                                {
                                    name: 'Hepatitis B',
                                    dose_number: 1,
                                    is_required: true
                                }
                            ]
                        },
                        {
                            age: '2 months',
                            vaccines: [
                                {
                                    name: 'DTaP',
                                    dose_number: 1,
                                    is_required: true
                                },
                                {
                                    name: 'IPV',
                                    dose_number: 1,
                                    is_required: true
                                }
                            ]
                        }
                    ]
                };

                return {
                    success: true,
                    data: { schedule: mockSchedule },
                    message: 'Vaccination schedule retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${API_BASE_URL}/vaccines/schedule?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccination schedule');
            }

            return data;
        } catch (error) {
            console.error('Get vaccination schedule error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccination schedule',
            };
        }
    }

    // Search vaccines
    async searchVaccines(params = {}) {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 500));
                // Use the same logic as getAllVaccines for demo
                return this.getAllVaccines(params);
            }

            // Real API call
            const queryParams = new URLSearchParams(params);
            const response = await fetch(`${API_BASE_URL}/vaccines/search?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to search vaccines');
            }

            return data;
        } catch (error) {
            console.error('Search vaccines error:', error);
            return {
                success: false,
                message: error.message || 'Failed to search vaccines',
            };
        }
    }

    // Get available categories
    async getCategories() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const categories = [
                    'viral', 'bacterial', 'travel', 'seasonal', 'occupational'
                ];

                return {
                    success: true,
                    data: { categories },
                    message: 'Categories retrieved successfully'
                };
            }

            // Real API call would be implemented here
            return {
                success: true,
                data: { categories: [] },
                message: 'Categories retrieved successfully'
            };
        } catch (error) {
            console.error('Get categories error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch categories',
            };
        }
    }

    // Get available age groups
    async getAgeGroups() {
        try {
            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const ageGroups = [
                    { id: 'infant', label: 'Infant (0-12 months)' },
                    { id: 'child', label: 'Child (1-12 years)' },
                    { id: 'adolescent', label: 'Adolescent (13-17 years)' },
                    { id: 'adult', label: 'Adult (18+ years)' },
                    { id: 'elderly', label: 'Elderly (65+ years)' }
                ];

                return {
                    success: true,
                    data: { age_groups: ageGroups },
                    message: 'Age groups retrieved successfully'
                };
            }

            // Real API call would be implemented here
            return {
                success: true,
                data: { age_groups: [] },
                message: 'Age groups retrieved successfully'
            };
        } catch (error) {
            console.error('Get age groups error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch age groups',
            };
        }
    }
}

// Create and export a singleton instance
const vaccineService = new VaccineService();
export default vaccineService;
