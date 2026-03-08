import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, ShieldCheck, Clock, CreditCard, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                Parking Made <span className="text-indigo-600">Smart</span> & <span className="text-emerald-600">Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                SpotSense uses advanced computer vision to provide real-time parking availability, seamless reservations, and automated billing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Car className="w-8 h-8 text-indigo-600" />,
              title: "Real-Time Monitoring",
              desc: "View available parking slots instantly with our live dashboard powered by computer vision."
            },
            {
              icon: <Clock className="w-8 h-8 text-emerald-600" />,
              title: "Smart Reservations",
              desc: "Book your spot in advance and save time. No more circling around looking for parking."
            },
            {
              icon: <CreditCard className="w-8 h-8 text-amber-600" />,
              title: "Automated Billing",
              desc: "Seamless entry and exit with automatic fee calculation based on your parking duration."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900 text-white py-20 rounded-3xl mx-4 sm:mx-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How SpotSense Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the future of parking in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { step: "01", title: "Check Availability", desc: "Open the app to see real-time slot status." },
              { step: "02", title: "Reserve & Park", desc: "Book a slot and get guided directly to your spot." },
              { step: "03", title: "Auto-Pay & Go", desc: "Exit seamlessly with automated billing calculation." }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-gray-800 mb-4 opacity-50">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
