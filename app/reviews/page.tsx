import Reviews from "@/components/reviews"
import ReviewForm from "@/components/review-form"

export default function ReviewsPage() {
  return (
    <main className="pt-20">
      <div className="bg-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Share Your Experience</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help others by sharing your treatment journey with Doctor Active Plus.
          </p>
        </div>
      </div>

      {/* Review Form First */}
      <section className="py-10 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReviewForm />
        </div>
      </section>

      {/* Reviews from Firebase */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">What Our Patients Say</h2>
          <Reviews />
        </div>
      </section>
    </main>
  )
}
