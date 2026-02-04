import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-bantconfirm-blue rounded-lg flex items-center justify-center text-white"><MessageCircle size={20} /></div>
          <span className="text-xl font-bold">BantConfirm</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-bantconfirm-blue">Login</Link>
          <Button className="bg-bantconfirm-blue hover:bg-bantconfirm-blue/90 text-white rounded-full px-6">Start Free</Button>
        </div>
      </header>
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-bantconfirm-blue text-sm font-medium">Meta-Compliant Platform</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">Smarter WhatsApp <span className="text-bantconfirm-blue">Communication</span></h1>
          <p className="text-xl text-gray-600">Automate chats, manage teams, and send compliant bulk messages with AI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button size="lg" className="bg-bantconfirm-blue hover:bg-bantconfirm-blue/90 text-white rounded-xl px-8 py-6 text-lg shadow-lg shadow-blue-200">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-lg">Book Demo</Button>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4 text-sm text-gray-500">
            {['Secure', 'Meta-Compliant', 'Multi-Tenant'].map(t => <div key={t} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-bantconfirm-blue" /> {t}</div>)}
          </div>
        </div>
        <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 overflow-hidden">
          <div className="h-64 sm:h-80 bg-gray-50 rounded-xl p-6 flex flex-col gap-4">
            <div className="h-10 w-full border-b border-gray-100 flex items-center gap-3 pb-4">
              <div className="w-8 h-8 rounded-full bg-bantconfirm-blue/10" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-end"><div className="bg-bantconfirm-blue text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm">How can we help?</div></div>
              <div className="flex justify-start"><div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none text-sm">I'd like a demo!</div></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
