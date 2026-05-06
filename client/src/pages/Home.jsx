import React from 'react'
import Navbar from '../components/LandingPage/NavBar'
import HeroSection from '../components/LandingPage/HeroSection'
import CapabilitiesSection from '../components/LandingPage/CapabilitiesSection'
import HowItWorks from '../components/LandingPage/HowItWorks'
import TestimonialsAndCTA from '../components/LandingPage/Testimonialsandcta'
import Footer from '../components/LandingPage/Footer'
const Home = () => {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <CapabilitiesSection />
            <HowItWorks />
            <TestimonialsAndCTA />
            <Footer />
        </div>
    )
}

export default Home
