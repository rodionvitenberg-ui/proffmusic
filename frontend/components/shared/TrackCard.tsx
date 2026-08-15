'use client';
import Image from 'next/image';
import { Play, Pause, ShoppingBag, Check } from 'lucide-react';
import { Track, useCartStore, usePlayerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/price';

interface TrackCardProps {
  track: Track;
  playlist?: Track[];
}

export function TrackCard({ track, playlist }: TrackCardProps) {
  const router = useRouter();
  const t = useTranslations('trackCard');
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { addToCart, removeFromCart, isInCart } = useCartStore();

  const isCurrent = currentTrack?.id === track.id;
  const isActive = isCurrent && isPlaying;
  const added = isInCart(track.id, 'track');

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      setTrack(track, playlist);
    }
  };

  const handleCartToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) {
      removeFromCart(track.id, 'track');
      toast.info(t('removed'), { description: t('trackRemovedFromCart') });
    } else {
      addToCart(track, 'track');
      toast.success(t('added'), { description: t('trackAddedToCart') });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!added) {
      addToCart(track, 'track');
    }
    router.push('/cart');
  };

  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={track.cover_image || '/placeholder.jpg'}
          alt={track.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover outline outline-1 -outline-offset-1 outline-white/10"
        />
        <button
          type="button"
          onClick={handlePlayClick}
          data-active={isActive}
          aria-label={isActive ? 'Pause' : 'Play'}
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 hover:opacity-100',
            isActive && 'opacity-100'
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-[0.96]">
            {isActive ? <Pause size={24} /> : <Play size={24} className="translate-x-[2px]" />}
          </span>
        </button>
      </div>

      <Link href={`/tracks/${track.slug}`} className="mt-2 block w-fit max-w-full">
        <h3 className={cn(
          'truncate text-lg font-medium text-foreground',
          isCurrent && 'text-primary'
        )}>
          {track.title}
        </h3>
      </Link>

      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="max-w-[60%] truncate text-sm text-muted-foreground">
          {track.category?.name || 'ProffMusic'}
        </span>
        <span className="tabular-nums text-foreground">{formatPrice(track.price)}</span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
        <Button variant="outline" onClick={handleBuyNow} className="w-full">
          {t('buy')}
        </Button>
        <Button variant={added ? 'outline' : 'default'} onClick={handleCartToggle} className="w-full">
          {added ? (
            <>
              <Check size={16} />
              {t('inCart')}
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              {t('addToCart')}
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
