import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL
const API_BASE_URL = 'https://test2medicoonect.vercel.app/api';

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
        // Extract params outside try block so they're accessible in catch
        const {
            page = 1,
            limit = 10,
            search = '',
            category = '',
            age_group = '',
            required = ''
        } = params;

        try {
            await this.initializeAuth(); // Ensure auth token is loaded

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
            }            // Real API call - Your backend uses 'name' instead of 'search'
            const queryParams = new URLSearchParams();

            // Map app parameters to backend parameters
            if (search && search.trim() !== '') {
                queryParams.append('name', search.trim());
            }
            // If no search term, add empty name to satisfy backend requirement
            if (!search || search.trim() === '') {
                queryParams.append('name', '');
            }

            console.log('Fetching vaccines with params:', queryParams.toString());
            console.log('Using auth token:', this.authToken ? 'Token present' : 'No token');

            const response = await fetch(`${API_BASE_URL}/vaccines?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('⚠️ Vaccines API not available (404 or HTML response)');
                console.warn('⚠️ Using demo data. Create /api/vaccines endpoint on backend.');
                throw new Error('ENDPOINT_NOT_FOUND');
            }

            const data = await response.json();
            console.log('Vaccines API Response:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                const errorMessage = data.error || data.message || `HTTP ${response.status}: Failed to fetch vaccines`;
                console.error('API Error:', errorMessage);
                throw new Error(errorMessage);
            }            // Handle API response structure
            if (data.success && data.data) {
                // Your backend returns data directly as array or object
                const vaccines = Array.isArray(data.data) ? data.data : (data.data.vaccines || []);
                console.log('✅ Received', vaccines.length, 'vaccines from backend');

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

                // Your backend doesn't return pagination, so add it client-side
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedVaccines = vaccines.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: {
                        vaccines: paginatedVaccines,
                        pagination: {
                            page: page,
                            limit: limit,
                            total: vaccines.length,
                            total_pages: Math.ceil(vaccines.length / limit)
                        }
                    },
                    message: data.message || 'Vaccines retrieved successfully'
                };
            } else if (data.vaccines) {
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
                };
            } else {
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

            // If endpoint not found, use demo data
            if (error.message === 'ENDPOINT_NOT_FOUND' || error.message.includes('JSON Parse')) {
                console.log('📦 Using demo vaccine data (backend endpoint not available)');

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
                        vaccine.age_groups.includes(age_group)
                    );
                }

                if (required === 'true') {
                    filteredVaccines = filteredVaccines.filter(vaccine => vaccine.is_required);
                }

                // Pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedVaccines = filteredVaccines.slice(startIndex, endIndex);

                return {
                    success: true,
                    data: {
                        vaccines: paginatedVaccines,
                        pagination: {
                            page: page,
                            limit: limit,
                            total: filteredVaccines.length,
                            total_pages: Math.ceil(filteredVaccines.length / limit)
                        }
                    },
                    message: 'Demo vaccines loaded (backend endpoint not available)'
                };
            }

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

    // Get vaccine availability at specific locations
    async getVaccineAvailability(vaccineId, location = null, ageGroup = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const vaccine = MOCK_VACCINES.find(v => v.id === vaccineId);
                if (!vaccine) {
                    throw new Error('Vaccine not found');
                }

                // Check age group compatibility
                if (ageGroup && !vaccine.age_groups.includes(ageGroup)) {
                    return {
                        success: true,
                        data: {
                            availability: {
                                vaccine_id: vaccineId,
                                vaccine_name: vaccine.name,
                                age_group_compatible: false,
                                locations: []
                            }
                        },
                        message: `${vaccine.name} is not available for ${ageGroup} age group`
                    };
                }

                // Mock availability data with enhanced booking information
                const availability = {
                    vaccine_id: vaccineId,
                    vaccine_name: vaccine.name,
                    brand: vaccine.brand,
                    age_group_compatible: !ageGroup || vaccine.age_groups.includes(ageGroup),
                    total_locations: 4,
                    locations: [
                        {
                            hospital_id: 'hospital-1',
                            hospital_name: 'City General Hospital',
                            hospital_type: 'public',
                            available_doses: Math.floor(Math.random() * 50) + 10,
                            next_available_date: '2025-01-20',
                            latest_available_date: '2025-01-25',
                            cost: vaccine.cost,
                            distance: 2.3,
                            booking_enabled: true,
                            appointment_required: true,
                            walk_in_available: false,
                            operating_hours: {
                                weekdays: '08:00-17:00',
                                weekends: '09:00-15:00'
                            },
                            contact_phone: '+1-555-0123',
                            insurance_accepted: true
                        },
                        {
                            hospital_id: 'hospital-3',
                            hospital_name: 'Community Wellness Clinic',
                            hospital_type: 'public',
                            available_doses: Math.floor(Math.random() * 30) + 5,
                            next_available_date: '2025-01-22',
                            latest_available_date: '2025-01-28',
                            cost: vaccine.cost,
                            distance: 3.1,
                            booking_enabled: true,
                            appointment_required: false,
                            walk_in_available: true,
                            operating_hours: {
                                weekdays: '07:00-19:00',
                                weekends: '08:00-16:00'
                            },
                            contact_phone: '+1-555-0789',
                            insurance_accepted: true
                        },
                        {
                            hospital_id: 'hospital-2',
                            hospital_name: 'Metro Health Center',
                            hospital_type: 'private',
                            available_doses: Math.floor(Math.random() * 25) + 8,
                            next_available_date: '2025-01-21',
                            latest_available_date: '2025-01-26',
                            cost: vaccine.cost + 15, // Private center markup
                            distance: 1.8,
                            booking_enabled: true,
                            appointment_required: true,
                            walk_in_available: false,
                            operating_hours: {
                                weekdays: '06:00-20:00',
                                weekends: '08:00-18:00'
                            },
                            contact_phone: '+1-555-0456',
                            insurance_accepted: true
                        }
                    ]
                };

                return {
                    success: true,
                    data: { availability },
                    message: 'Vaccine availability retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams();
            if (location) {
                queryParams.append('location', location);
            }
            if (ageGroup) {
                queryParams.append('age_group', ageGroup);
            }

            const response = await fetch(`${API_BASE_URL}/vaccines/${vaccineId}/availability?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccine availability');
            }

            return data;
        } catch (error) {
            console.error('Get vaccine availability error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccine availability',
            };
        }
    }

    // Get vaccination centers offering specific vaccines
    async getVaccinationCenters(vaccineId, location = null, radius = 10) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 700));

                const vaccine = MOCK_VACCINES.find(v => v.id === vaccineId);
                if (!vaccine) {
                    throw new Error('Vaccine not found');
                }

                const centers = [
                    {
                        id: 'center-1',
                        name: 'City Vaccination Center',
                        type: 'public',
                        address: '123 Health St, New York, NY 10001',
                        phone: '+1-555-0123',
                        email: 'info@cityvaccination.gov',
                        coordinates: { latitude: 40.7128, longitude: -74.0060 },
                        distance: 1.5,
                        available_vaccines: [vaccineId],
                        available_doses: Math.floor(Math.random() * 100) + 20,
                        next_available_appointment: '2025-01-20T09:00:00Z',
                        operating_hours: {
                            weekdays: '08:00-18:00',
                            weekends: '09:00-15:00'
                        },
                        appointment_required: true,
                        walk_in_available: false,
                        online_booking_available: true,
                        cost: vaccine.cost,
                        insurance_accepted: true,
                        accepted_insurance: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna'],
                        age_restrictions: vaccine.age_groups,
                        special_requirements: vaccine.contraindications,
                        booking_url: 'https://cityvaccination.gov/book',
                        rating: 4.5,
                        reviews_count: 234
                    },
                    {
                        id: 'center-2',
                        name: 'Metro Health Vaccination Hub',
                        type: 'private',
                        address: '456 Wellness Ave, New York, NY 10002',
                        phone: '+1-555-0456',
                        email: 'appointments@metrohealth.com',
                        coordinates: { latitude: 40.7589, longitude: -73.9851 },
                        distance: 2.8,
                        available_vaccines: [vaccineId],
                        available_doses: Math.floor(Math.random() * 75) + 15,
                        next_available_appointment: '2025-01-21T10:30:00Z',
                        operating_hours: {
                            weekdays: '07:00-19:00',
                            weekends: '08:00-16:00'
                        },
                        appointment_required: false,
                        walk_in_available: true,
                        online_booking_available: true,
                        cost: vaccine.cost + 10, // Private center markup
                        insurance_accepted: true,
                        accepted_insurance: ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth'],
                        age_restrictions: vaccine.age_groups,
                        special_requirements: vaccine.contraindications,
                        booking_url: 'https://metrohealth.com/vaccine-booking',
                        rating: 4.7,
                        reviews_count: 156
                    },
                    {
                        id: 'center-3',
                        name: 'Community Health Clinic',
                        type: 'community',
                        address: '789 Community Blvd, New York, NY 10003',
                        phone: '+1-555-0789',
                        email: 'vaccines@communityhealth.org',
                        coordinates: { latitude: 40.7282, longitude: -73.7949 },
                        distance: 4.2,
                        available_vaccines: [vaccineId],
                        available_doses: Math.floor(Math.random() * 50) + 10,
                        next_available_appointment: '2025-01-23T14:00:00Z',
                        operating_hours: {
                            weekdays: '09:00-17:00',
                            weekends: '10:00-14:00'
                        },
                        appointment_required: true,
                        walk_in_available: true,
                        online_booking_available: false,
                        cost: vaccine.cost - 5, // Community discount
                        insurance_accepted: true,
                        accepted_insurance: ['Medicare', 'Medicaid'],
                        age_restrictions: vaccine.age_groups,
                        special_requirements: vaccine.contraindications,
                        booking_url: null,
                        rating: 4.2,
                        reviews_count: 89
                    }
                ];

                // Filter by location radius if provided
                const filteredCenters = location ?
                    centers.filter(center => center.distance <= radius) :
                    centers;

                return {
                    success: true,
                    data: {
                        vaccine_id: vaccineId,
                        vaccine_name: vaccine.name,
                        search_location: location,
                        search_radius: radius,
                        centers: filteredCenters,
                        total: filteredCenters.length,
                        total_available_doses: filteredCenters.reduce((sum, center) => sum + center.available_doses, 0)
                    },
                    message: 'Vaccination centers retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams();
            if (location) {
                queryParams.append('location', location);
                queryParams.append('radius', radius.toString());
            }

            const response = await fetch(`${API_BASE_URL}/vaccines/${vaccineId}/centers?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccination centers');
            }

            return data;
        } catch (error) {
            console.error('Get vaccination centers error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccination centers',
            };
        }
    }

    // Get available appointment time slots for vaccine booking
    async getVaccineAppointmentSlots(centerId, vaccineId, date) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 600));

                const vaccine = MOCK_VACCINES.find(v => v.id === vaccineId);
                if (!vaccine) {
                    throw new Error('Vaccine not found');
                }

                // Generate mock appointment slots
                const timeSlots = [];
                const startHour = 9;
                const endHour = 17;
                const slotDuration = 15; // 15-minute slots for vaccines

                for (let hour = startHour; hour < endHour; hour++) {
                    for (let minute = 0; minute < 60; minute += slotDuration) {
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        const isAvailable = Math.random() > 0.4; // 60% availability

                        timeSlots.push({
                            time,
                            available: isAvailable,
                            duration: slotDuration,
                            cost: vaccine.cost,
                            booking_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
                        });
                    }
                }

                return {
                    success: true,
                    data: {
                        center_id: centerId,
                        vaccine_id: vaccineId,
                        vaccine_name: vaccine.name,
                        date,
                        time_slots: timeSlots,
                        total_slots: timeSlots.length,
                        available_slots: timeSlots.filter(slot => slot.available).length,
                        slot_duration: slotDuration,
                        preparation_instructions: [
                            'Bring valid ID and insurance card',
                            'Arrive 15 minutes early',
                            'Wear loose-fitting clothing',
                            'Inform staff of any allergies'
                        ]
                    },
                    message: 'Vaccine appointment slots retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams({
                vaccine_id: vaccineId,
                date
            });

            const response = await fetch(`${API_BASE_URL}/vaccination-centers/${centerId}/appointment-slots?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccine appointment slots');
            }

            return data;
        } catch (error) {
            console.error('Get vaccine appointment slots error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccine appointment slots',
            };
        }
    }

    // Get vaccine booking requirements and eligibility
    async getVaccineBookingRequirements(vaccineId, ageGroup = null, medicalHistory = null) {
        try {
            await this.initializeAuth();

            if (DEMO_MODE) {
                await new Promise(resolve => setTimeout(resolve, 400));

                const vaccine = MOCK_VACCINES.find(v => v.id === vaccineId);
                if (!vaccine) {
                    throw new Error('Vaccine not found');
                }

                const requirements = {
                    vaccine_id: vaccineId,
                    vaccine_name: vaccine.name,
                    eligible: !ageGroup || vaccine.age_groups.includes(ageGroup),
                    age_requirements: vaccine.age_groups,
                    contraindications: vaccine.contraindications,
                    required_documents: [
                        'Valid government-issued ID',
                        'Insurance card (if applicable)',
                        'Previous vaccination records (if applicable)'
                    ],
                    pre_vaccination_requirements: [
                        'No fever or illness symptoms',
                        'Not currently taking immunosuppressive medications',
                        'No severe allergic reactions to previous vaccines'
                    ],
                    waiting_period_after: '15-30 minutes for observation',
                    side_effects: vaccine.side_effects,
                    doses_required: vaccine.doses_required,
                    interval_between_doses: vaccine.interval_between_doses,
                    booster_required: vaccine.booster_required,
                    booster_interval: vaccine.booster_interval,
                    cost_information: {
                        base_cost: vaccine.cost,
                        insurance_covered: vaccine.cost === 0 || vaccine.is_required,
                        payment_methods: ['Cash', 'Credit Card', 'Insurance']
                    }
                };

                return {
                    success: true,
                    data: { requirements },
                    message: 'Vaccine booking requirements retrieved successfully'
                };
            }

            // Real API call
            const queryParams = new URLSearchParams();
            if (ageGroup) {
                queryParams.append('age_group', ageGroup);
            }
            if (medicalHistory) {
                queryParams.append('medical_history', JSON.stringify(medicalHistory));
            }

            const response = await fetch(`${API_BASE_URL}/vaccines/${vaccineId}/booking-requirements?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to fetch vaccine booking requirements');
            }

            return data;
        } catch (error) {
            console.error('Get vaccine booking requirements error:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vaccine booking requirements',
            };
        }
    }
}

// Create and export a singleton instance
const vaccineService = new VaccineService();
export default vaccineService;
