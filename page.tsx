import AIAssistant from '../components/AIAssistant'
export default function Home() {
  return (
    <div className='p-8 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <div><h1 className='text-3xl font-bold'><span className='text-bant'>BANT</span><span className='text-confirm'>Confirm</span></h1><p className='text-gray-600'>AI-assisted B2B marketplace</p></div>
        <div className='space-x-3'><a href='/login' className='text-bant'>Login</a><a href='/signup' className='btn-accent'>Sign Up</a></div>
      </div>
      <section className='grid md:grid-cols-3 gap-6'>
        <div className='card md:col-span-2'>
          <h2 className='text-xl font-semibold mb-2'>Product catalog</h2>
          <p className='text-gray-500'>Browse products, post enquiries and get matched with vendors.</p>
        </div>
        <aside className='card'><AIAssistant /></aside>
      </section>
    </div>
  )
}
