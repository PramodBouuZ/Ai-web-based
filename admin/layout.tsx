import Link from 'next/link'
export default function AdminLayout({ children }){
  return (<div className='min-h-screen bg-gray-50'><aside className='w-64 fixed h-full bg-white p-4 border-r'><h2 className='font-bold text-xl'>Admin</h2><nav className='mt-4 space-y-2'><a href='/admin' className='block'>Home</a><a href='/admin/enquiries' className='block'>Enquiries</a><a href='/admin/products' className='block'>Products</a></nav></aside><main className='ml-64 p-8'>{children}</main></div>)
}
