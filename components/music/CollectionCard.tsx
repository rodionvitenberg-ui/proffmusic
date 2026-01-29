'use client';

import Link from 'next/link';
import { ShoppingBag, Disc, Check } from 'lucide-react'; // Добавил Check
import { Collection, useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';

export function CollectionCard({ collection }: { collection: Collection }) {
  const { addToCart, removeFromCart, isInCart } = useCartStore();
  const added = isInCart(collection.id, 'collection');

  const handleCartToggle = () => {
    if (added) {
      removeFromCart(collection.id, 'collection');
      toast.info('Убрано из корзины', {
        description: `Сборник "${collection.title}" удален`,
        duration: 2000,
      });
    } else {
      addToCart(collection, 'collection');
      toast.success('Сборник добавлен', {
        description: `${collection.title} в корзине`,
        duration: 3000,
      });
    }
  };

  return (
    <Card className="group relative bg-[#181818] border-white/5 hover:bg-[#202020] hover:border-white/10 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md h-full">
      <CardContent className="p-4 h-full flex flex-col">
        
        <Link href={`/collections/${collection.slug}`} className="block">
          <div className="relative aspect-square rounded-md overflow-hidden mb-4 bg-gray-800 shadow-inner cursor-pointer">
            <img 
              src={collection.cover_image || '/placeholder.jpg'} 
              alt={collection.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1 shadow-sm">
               <Disc size={12} />
               {collection.tracks?.length || 0}
            </div>
          </div>
        </Link>

        <div className="flex justify-between items-start gap-3 mt-auto">
          <div className="min-w-0 flex-1">
            <Link href={`/collections/${collection.slug}`}>
              <h3 className="font-semibold text-base text-white truncate pr-2 hover:text-purple-400 transition-colors">
                {collection.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-400 truncate line-clamp-1">
              {collection.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sm font-bold text-white">{collection.price} ₽</span>
            
            <Button 
              size="sm" 
              onClick={handleCartToggle}
              className={cn(
                "h-8 px-3 transition-all duration-200 transform shadow-sm",
                added 
                  ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-95"
                  : "bg-white text-black hover:bg-gray-200 hover:shadow-md active:scale-90 active:bg-gray-300"
              )}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}