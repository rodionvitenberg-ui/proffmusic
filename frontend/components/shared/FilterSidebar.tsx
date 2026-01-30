'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { Category, Tag } from '@/lib/store';
import { cn } from '@/lib/utils';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FilterSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function FilterSidebar({ mobileOpen, setMobileOpen }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [openSections, setOpenSections] = useState<string[]>(['category', 'mood', 'instrument', 'usage']);

  const activeCategory = searchParams.get('category__slug');
  const rawTags = searchParams.get('tags__slug');
  const activeTags = rawTags ? rawTags.split(',').filter(Boolean) : [];

  const hasActiveFilters = activeCategory || activeTags.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/api/categories/'),
          api.get('/api/tags/')
        ]);
        setCategories(catRes.data);
        const loadedTags: Tag[] = tagRes.data;
        setTags(loadedTags);

        const sectionsToOpen = new Set(openSections);
        
        if (activeCategory) sectionsToOpen.add('category');

        activeTags.forEach(slug => {
          const tag = loadedTags.find(t => t.slug === slug);
          if (tag) {
             sectionsToOpen.add(tag.tag_type);
          }
        });

        setOpenSections(Array.from(sectionsToOpen));

      } catch (e) {
        console.error('Ошибка загрузки фильтров', e);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- ХЕНДЛЕРЫ ---

  // Общая функция обновления URL
  const updateFilters = (params: URLSearchParams) => {
    // Сбрасываем пагинацию при любой фильтрации
    params.delete('page');
    const queryString = params.toString();
    
    startTransition(() => {
      // ГЛАВНОЕ ИСПРАВЛЕНИЕ:
      // 1. replace вместо push (чтобы не засорять историю браузера каждым кликом)
      // 2. scroll: false (чтобы страница НЕ прыгала наверх)
      router.replace(`/music?${queryString}`, { scroll: false });
    });
  };

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Если кликнули по уже активной категории — снимаем выбор
    if (activeCategory === slug) {
      params.delete('category__slug');
    } else {
      params.set('category__slug', slug);
      // Убеждаемся, что секция остается открытой
      if (!openSections.includes('category')) {
         setOpenSections(prev => [...prev, 'category']);
      }
    }
    
    updateFilters(params);
  };

  const handleTagFilter = (slug: string, type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newTags = [...activeTags];

    if (newTags.includes(slug)) {
      newTags = newTags.filter(t => t !== slug);
    } else {
      newTags.push(slug);
    }

    if (newTags.length > 0) {
      params.set('tags__slug', newTags.join(','));
    } else {
      params.delete('tags__slug');
    }

    if (!openSections.includes(type)) {
       setOpenSections(prev => [...prev, type]);
    }

    updateFilters(params);
  };

  const clearAll = () => {
    startTransition(() => {
      // Здесь тоже scroll: false, чтобы при сбросе не кидало вверх
      router.replace('/music', { scroll: false });
    });
  };

  const groupedTags = {
    mood: tags.filter(t => t.tag_type === 'mood'),
    instrument: tags.filter(t => t.tag_type === 'instrument'),
    usage: tags.filter(t => t.tag_type === 'usage'),
  };

  const TagGroupAccordion = ({ 
    value, 
    title, 
    items, 
    colorClass 
  }: { 
    value: string, 
    title: string, 
    items: Tag[], 
    colorClass: string 
  }) => (
    <AccordionItem value={value} className="border-b-white/5 max-h-[200px] last:border-0">
      <AccordionTrigger className="text-sm font-semibold text-gray-400 hover:text-white hover:no-underline py-3 uppercase tracking-wider">
        {title}
      </AccordionTrigger>
      <AccordionContent className="bg-transparent border-none p-0 pb-4">
        <div className="flex flex-wrap gap-2">
          {items.map((tag) => {
            const isActive = activeTags.includes(tag.slug);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagFilter(tag.slug, value)} 
                disabled={isPending}
                className={cn(
                  "px-3 py-1 rounded-full text-xs border transition-all duration-200",
                  "text-center min-w-[30px]",
                  // Визуальная индикация, что клик прошел, но данные еще грузятся
                  isPending ? "opacity-70 cursor-wait" : "cursor-pointer",
                  isActive
                    ? cn("text-white border-transparent shadow-md transform scale-100", colorClass)
                    : "border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200 bg-[#181818]"
                )}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  const SidebarContent = () => (
    <div className="space-y-4 pb-20">
      
      <div className="flex items-center justify-between h-6 mb-2"> 
        <h3 className="text-lg font-bold text-white">Фильтры</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearAll}
          disabled={!hasActiveFilters || isPending}
          className={cn(
            "h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all",
            (!hasActiveFilters) && "opacity-0 invisible pointer-events-none"
          )}
        >
          Сбросить
        </Button>
      </div>

      <Accordion 
        type="multiple" 
        value={openSections}
        onValueChange={setOpenSections}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b-white/5">
          <AccordionTrigger className="text-sm font-semibold text-gray-400 hover:text-white hover:no-underline py-2 uppercase tracking-wider">
            Жанры
          </AccordionTrigger>
          <AccordionContent className="bg-transparent border-none p-0 pb-4">
            <RadioGroup 
              value={activeCategory || ""} 
              onValueChange={handleCategoryFilter}
              className="flex flex-col gap-1"
            >
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer group",
                    "hover:bg-white/5",
                    activeCategory === cat.slug ? "bg-white/5" : ""
                  )}
                  onClick={() => !isPending && handleCategoryFilter(cat.slug)}
                >
                  <RadioGroupItem
                    value={cat.slug}
                    id={cat.slug}
                    disabled={isPending}
                    className="size-4 shrink-0 border-white/30 text-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <Label
                    htmlFor={cat.slug}
                    disableAnimation={true}
                    className={cn(
                      "text-sm cursor-pointer select-none w-full",
                      activeCategory === cat.slug
                        ? "text-white font-medium"
                        : "text-gray-400 group-hover:text-gray-300",
                       isPending && "opacity-70"
                    )}
                  >
                    {cat.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <TagGroupAccordion 
          value="mood" 
          title="Настроение" 
          items={groupedTags.mood} 
          colorClass="bg-purple-600" 
        />
        <TagGroupAccordion 
          value="instrument" 
          title="Инструменты" 
          items={groupedTags.instrument} 
          colorClass="bg-blue-600" 
        />
        <TagGroupAccordion 
          value="usage" 
          title="Назначение" 
          items={groupedTags.usage} 
          colorClass="bg-green-600" 
        />
      </Accordion>
    </div>
  );

  return (
    <>
      {/* ДЕСКТОП САЙДБАР */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
        <SidebarContent />
      </aside>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      {mobileOpen && (
        <div className="fixed inset-0 top-20 z-[60] lg:hidden">
          
          {/* Фон */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileOpen?.(false)}
          />
          
          {/* КОНТЕЙНЕР (Изменено: flex-col, убран общий скролл и общий паддинг) */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-[#121212] flex flex-col shadow-2xl animate-in slide-in-from-right border-l border-white/10">
            
            {/* ШАПКА (Добавлен паддинг) */}
            <div className="flex justify-between items-center p-6 pb-2 shrink-0">
              <h2 className="text-xl font-bold text-white"></h2> 
              <button 
                onClick={() => setMobileOpen?.(false)} 
                className="ml-auto p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* СКРОЛЛИРУЕМЫЙ КОНТЕНТ (Вот он теперь занимает всё свободное место) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
              <SidebarContent />
            </div>
            
            {/* КНОПКА (Прижата к низу, без sticky, просто лежит внизу flex-контейнера) */}
            <div className="p-6 border-t border-white/10 bg-[#121212] shrink-0 pb-safe">
               <Button 
                 className="w-full h-12 text-base font-bold bg-white text-black hover:bg-gray-200"
                 onClick={() => setMobileOpen?.(false)}
               >
                 {isPending ? "Загрузка..." : "Показать результаты"}
               </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}