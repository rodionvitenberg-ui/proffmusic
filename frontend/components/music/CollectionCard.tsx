'use client';

import { ShoppingBag, Disc, Check, Banknote } from 'lucide-react';
import { Collection, useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function CollectionCard({ collection }: { collection: Collection }) {
  const router = useRouter();
  const t = useTranslations('collectionCard');
  const { addToCart, removeFromCart, isInCart } = useCartStore();
  const added = isInCart(collection.id, 'collection');

  const handleCartToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (added) {
      removeFromCart(collection.id, 'collection');
      toast.info(t('removed'), { description: t('removedDesc') });
    } else {
      addToCart(collection, 'collection');
      toast.success(t('added'), { description: t('addedDesc') });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!added) {
      addToCart(collection, 'collection');
    }
    router.push('/cart');
  };

  return (
    <div className="h-[380px] flex flex-col bg-[#181818] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300 hover:shadow-md group">

      <Link href={`/collections/${collection.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-gray-800 shadow-inner">
        <Image
          src={collection.cover_image || '/placeholder.jpg'}
          alt={collection.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-white flex items-center gap-1 shadow-sm border border-white/10">
          <Disc size={12} />
          {collection.tracks?.length || 0}
        </div>
      </Link>

      <div className="mt-3">
        <Link href={`/collections/${collection.slug}`}>
          <h3 className="font-bold text-lg text-white truncate hover:text-green-400 transition-colors">
            {collection.title}
          </h3>
        </Link>
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-auto">
        <span className="text-sm text-gray-400 truncate max-w-[60%]">
          {t('collection')}
        </span>
        <span className="text-lg font-bold text-white tabular-nums">
          {collection.price} ₽
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Button
          variant="outline"
          onClick={handleBuyNow}
          className="w-full h-10 border-white/20 hover:border-white font-bold uppercase tracking-wide text-xs text-white"
        >
          <Banknote size={14} className="mr-2" />
          {t('buyNow')}
        </Button>

        <Button
          onClick={handleCartToggle}
          className={cn(
            "w-full h-10 font-bold uppercase tracking-wide text-xs transition-all",
            added
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-white hover:bg-border hover:text-white text-black"
          )}
        >
          {added ? (
            <>
              <Check size={16} className="mr-2" />
              {t('inCart')}
            </>
          ) : (
            <>
              <ShoppingBag size={16} className="mr-2" />
              {t('addToCart')}
            </>
          )}
        </Button>
      </div>

    </div>
  );
}