'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Check, X, FileText, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export default function LicensePage() {
  return (
    // ВНЕШНИЙ КОНТЕЙНЕР
    <div className="min-h-screen w-full px-2 md:px-0">
      
      {/* ВНУТРЕННИЙ КОНТЕЙНЕР ("ПОДФОН") */}
      <div className="mx-auto max-w-5xl min-h-screen bg-secondary border-x border-white/5 shadow-2xl pt-20 pb-20 px-6 md:px-16">
        
        {/* ЗАГОЛОВОК */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            One License.<br />
            Unlimited Possibilities.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We've simplified everything to the limit. By purchasing a track on ProffMusic, you get a lifetime right 
            to use it in your projects. No hidden fees or complicated terms.
          </p>
        </div>

        {/* ГЛАВНЫЕ ПЛЮСЫ (Карточки) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">YouTube Monetization</h3>
                <p className="text-gray-400 text-sm">
                    Your videos won't get strikes. You can peacefully enable monetization and earn income from ads.
                </p>
             </div>
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">Lifetime Rights</h3>
                <p className="text-gray-400 text-sm">
                    Paid once — used forever. Even if you delete your account or we close down.
                </p>
             </div>
             <div className="bg-[#181818] p-6 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-2 text-lg">For Any Platforms</h3>
                <p className="text-gray-400 text-sm">
                    Instagram, TikTok, Facebook, Twitch, YouTube, TV, cinema. No restrictions on platforms.
                </p>
             </div>
        </div>

        {/* СПИСКИ (МОЖНО / НЕЛЬЗЯ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            
            {/* ЧТО МОЖНО */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <Check size={20} strokeWidth={3} />
                    </span>
                    Allowed
                </h2>
                <ul className="space-y-4">
                    {[
                        "Using in personal and commercial videos.",
                        "Using in advertising (Targeting, TV, Radio).",
                        "Podcasts, audiobooks and meditations.",
                        "Movies, series and documentaries.",
                        "Freelancing (creating videos for clients).",
                        "Games and mobile applications.",
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                            <Check size={18} className="text-green-500 mt-1 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ЧТО НЕЛЬЗЯ */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <X size={20} strokeWidth={3} />
                    </span>
                    Not Allowed
                </h2>
                <ul className="space-y-4">
                    {[
                        "Claiming authorship of the music (you are purchasing the right to use it, not the authorship).",
                        "Uploading tracks to Content ID systems (this blocks other users).",
                        "Reselling music in its original form (on CDs, stock music).",
                        "Creating remixes and passing them off as your own original work.",
                        "Using in products where the music is the main item (e.g., musical toys without an Extended License).",
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                            <X size={18} className="text-red-500 mt-1 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* FAQ / ВАЖНОЕ */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" />
                Important Note about Content ID
            </h2>
            <div className="text-gray-300 space-y-4 text-sm leading-relaxed">
                <p>
                    ProffMusic guarantees that all tracks in our library are <strong>not registered in the Content ID system</strong>. 
                    This means you will not receive automatic complaints from YouTube.
                </p>
                <p>
                    However, we strictly prohibit our users from registering their videos with our music in the Content ID system. 
                    If you do this, you will violate the rights of other purchasers. Violation of this rule results in license cancellation.
                </p>
            </div>
        </div>

        {/* КОНТАКТЫ */}
        <div className="flex flex-col md:flex-row items-center justify-left gap-6 border-t border-white/10 pt-10">
            <div>
                <h3 className="text-white font-bold mb-1">Any questions?</h3>
                <p className="text-gray-500 text-sm">
                    Write to us if your project requires special conditions.
                </p>
            </div>
            <div className="flex gap-4">
                <Link href="/contacts">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black">
                        <HelpCircle size={16} className="mr-2" />
                        Contact Us
                    </Button>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}