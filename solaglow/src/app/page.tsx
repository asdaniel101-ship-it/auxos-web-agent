import Hero from '@/components/home/Hero'
import PressBar from '@/components/home/PressBar'
import BestSellers from '@/components/home/BestSellers'
import HowItWorks from '@/components/home/HowItWorks'
import ResultsPreview from '@/components/home/ResultsPreview'
import Testimonials from '@/components/home/Testimonials'
import Newsletter from '@/components/home/Newsletter'
import Community from '@/components/home/Community'

export default function Home() {
  return (
    <main>
      <Hero />
      <PressBar />
      <BestSellers />
      <HowItWorks />
      <ResultsPreview />
      <Testimonials />
      <Newsletter />
      <Community />
    </main>
  )
}
