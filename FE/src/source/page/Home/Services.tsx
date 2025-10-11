import React, { useState, useEffect, useRef } from 'react';
import CardServices from './CardServices';

function Services() {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for scroll-triggered animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const elementId = entry.target.getAttribute('data-animate-id');
                        if (elementId) {
                            setVisibleElements(prev => new Set([...prev, elementId]));
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe all elements with data-animate-id
        const animatedElements = document.querySelectorAll('[data-animate-id]');
        animatedElements.forEach((el) => observer.observe(el));

        return () => {
            animatedElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Hero Section */}
            <section 
                data-animate-id="hero"
                className={`bg-gradient-to-r from-sky-300 to-violet-400 dark:from-gray-800 dark:to-gray-700 text-white py-20 transition-all duration-1000 ${visibleElements.has('hero') ? 'animate__animated animate__fadeInDown' : 'opacity-0 translate-y-[-50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Laboratory Testing Services
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Comprehensive blood and chemical analysis services for accurate medical diagnosis and health monitoring
                    </p>
                </div>
            </section>

            {/* Main Services */}
            <section 
                data-animate-id="services-header"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('services-header') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        {"Our Testing Services".split(' ').map((word, index) => (
                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                {word}
                                {index < "Our Testing Services".split(' ').length - 1 && '\u00A0'}
                            </span>
                        ))}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                        We provide comprehensive laboratory testing services with state-of-the-art equipment and experienced technicians
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <CardServices
                        title="Blood Chemistry Analysis"
                        description="Complete blood count, glucose levels, cholesterol, and comprehensive metabolic panel testing"
                        icon="🧪"
                        features={[
                            "Complete Blood Count (CBC)",
                            "Blood Glucose & HbA1c",
                            "Lipid Profile",
                            "Liver Function Tests",
                            "Kidney Function Tests"
                        ]}
                    />
                    <CardServices
                        title="Hematology Testing"
                        description="Advanced blood cell analysis and coagulation studies for accurate diagnosis"
                        icon="🔬"
                        features={[
                            "Red Blood Cell Analysis",
                            "White Blood Cell Count",
                            "Platelet Function Tests",
                            "Coagulation Studies",
                            "Blood Typing & Crossmatch"
                        ]}
                    />
                    <CardServices
                        title="Immunology & Serology"
                        description="Comprehensive immune system testing and infectious disease screening"
                        icon="🦠"
                        features={[
                            "Autoimmune Disease Testing",
                            "Allergy Screening",
                            "Infectious Disease Panels",
                            "Hormone Level Testing",
                            "Tumor Marker Analysis"
                        ]}
                    />
                    <CardServices
                        title="Microbiology Testing"
                        description="Pathogen identification and antibiotic susceptibility testing"
                        icon="🔍"
                        features={[
                            "Bacterial Culture & Sensitivity",
                            "Fungal Identification",
                            "Viral Load Testing",
                            "Parasite Detection",
                            "Antibiotic Resistance Testing"
                        ]}
                    />
                    <CardServices
                        title="Toxicology Screening"
                        description="Comprehensive drug and toxin analysis for medical and legal purposes"
                        icon="⚗️"
                        features={[
                            "Drug Abuse Screening",
                            "Heavy Metal Testing",
                            "Pesticide Residue Analysis",
                            "Alcohol Level Testing",
                            "Forensic Toxicology"
                        ]}
                    />
                    <CardServices
                        title="Specialized Testing"
                        description="Advanced molecular diagnostics and genetic testing services"
                        icon="🧬"
                        features={[
                            "PCR Testing",
                            "Genetic Screening",
                            "Cancer Biomarkers",
                            "Prenatal Testing",
                            "Pharmacogenomics"
                        ]}
                    />
                </div>
            </section>


              {/* Process Section */}
            <section 
                data-animate-id="process"
                className={`bg-white dark:bg-gray-800 py-16 transition-all duration-1000 ${visibleElements.has('process') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            {"Our Testing Process".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Our Testing Process".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h2>
                        <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                            From sample collection to result delivery, we ensure accuracy and reliability at every step
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-xl mx-auto mb-4">1</div>
                            <h3 className="font-semibold mb-2">
                                {"Sample Collection".split(' ').map((word, index) => (
                                    <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                        {word}
                                        {index < "Sample Collection".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Professional blood draw and sample preparation</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-xl mx-auto mb-4">2</div>
                            <h3 className="font-semibold mb-2">
                                {"Laboratory Analysis".split(' ').map((word, index) => (
                                    <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                        {word}
                                        {index < "Laboratory Analysis".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Advanced testing with automated equipment</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-xl mx-auto mb-4">3</div>
                            <h3 className="font-semibold mb-2">
                                {"Quality Control".split(' ').map((word, index) => (
                                    <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                        {word}
                                        {index < "Quality Control".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Rigorous validation and quality assurance</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-xl mx-auto mb-4">4</div>
                            <h3 className="font-semibold mb-2">
                                {"Result Delivery".split(' ').map((word, index) => (
                                    <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                        {word}
                                        {index < "Result Delivery".split(' ').length - 1 && '\u00A0'}
                                    </span>
                                ))}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-gray-300">Secure digital delivery of test results</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipment Section */}
            <section 
                data-animate-id="equipment"
                className={`max-w-[1200px] mx-auto px-6 py-16 transition-all duration-1000 ${visibleElements.has('equipment') ? 'animate__animated animate__fadeInUp' : 'opacity-0 translate-y-[50px]'}`}
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        {"Advanced Laboratory Equipment".split(' ').map((word, index) => (
                            <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                {word}
                                {index < "Advanced Laboratory Equipment".split(' ').length - 1 && '\u00A0'}
                            </span>
                        ))}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
                        State-of-the-art instruments ensuring the highest accuracy and reliability
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🔬</div>
                        <h3 className="font-semibold mb-2">
                            {"Automated Analyzers".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Automated Analyzers".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">High-throughput chemistry and hematology analyzers</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🧬</div>
                        <h3 className="font-semibold mb-2">
                            {"Molecular Diagnostics".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Molecular Diagnostics".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">PCR machines and genetic testing equipment</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white grid place-items-center font-bold text-2xl mx-auto mb-4">🔍</div>
                        <h3 className="font-semibold mb-2">
                            {"Microscopy Systems".split(' ').map((word, index) => (
                                <span key={index} className="text-transparent bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text">
                                    {word}
                                    {index < "Microscopy Systems".split(' ').length - 1 && '\u00A0'}
                                </span>
                            ))}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-gray-300">Digital microscopy and imaging systems</p>
                    </div>
                </div>
            </section>
 
            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-sky-300 to-violet-400 text-white shadow-lg hover:from-sky-400 hover:to-violet-500 transition-all duration-300 z-50 flex items-center justify-center"
                    aria-label="Back to top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 2l8 8h-5v10h-6V10H4l8-8z" />
                    </svg>
                </button>
            )}
        </div>
    )
}

export default Services
