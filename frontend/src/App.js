import './index.css';
import Carousel from './components/Carousel';
import InfoSection from './components/InfoSection';
import WhySection from './components/WhySection';
import TestimonialsSection from './components/TestimonialsSection';
import CallToAction from './components/CallToAction';
import ProgramSection from './components/ProgramSection';
import TeamSection from './components/TeamSection';
import GustavRousyStats from './components/GustavRousyStats';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-gray-100 font-sans m-0">
      <Carousel />
      <InfoSection />
      <WhySection />
      <TestimonialsSection />
      <CallToAction />
      <ProgramSection />
      <TeamSection />
      <GustavRousyStats />
      <Footer />
    </div>
  );
}

export default App;
