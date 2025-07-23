
import '../index.css';
import Header from '../components/home/Header';
import Carousel from '../components/home/carousel';
import InfoSection from '../components/home/InfoSection';
import WhySection from '../components/home/WhySection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CallToAction from '../components/home/CallToAction';
import ProgramSection from '../components/home/ProgramSection';
import TeamSection from '../components/home/TeamSection';
import GustavRousyStats from '../components/home/GustavRousyStats';
import Footer from '../components/home/Footer';

function HomePage() {
  return (
    <>
      <Header />
      <Carousel />
      <InfoSection />
      <WhySection />
      <TestimonialsSection />
      <CallToAction />
      <ProgramSection />
      <TeamSection />
      <GustavRousyStats />
      <Footer />
    </>
  );
}

export default HomePage;