'use client'

export default function FeaturesSection() {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">Why Choose SecurePay?</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          title="Username Payments" 
          description="Send crypto using simple usernames instead of complex wallet addresses" 
        />
        <FeatureCard 
          title="Reversible Payments" 
          description="Payments can be reversed if not claimed within the expiration time" 
        />
        <FeatureCard 
          title="Secure & Fast" 
          description="Instant payments with built-in security and expiration protection" 
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}