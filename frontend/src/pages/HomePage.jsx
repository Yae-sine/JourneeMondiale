
import '../index.css';
import Carousel from '../components/carousel';
import InfoSection from '../components/InfoSection';
import WhySection from '../components/WhySection';
import TestimonialsSection from '../components/TestimonialsSection';
import CallToAction from '../components/CallToAction';
import ProgramSection from '../components/ProgramSection';
import TeamSection from '../components/TeamSection';
import GustavRousyStats from '../components/GustavRousyStats';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <>
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