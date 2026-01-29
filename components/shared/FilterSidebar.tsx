'use client';

import { useEffect, useState } from 'react';
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Состояние для открытых секций аккордеона.
  // По умолчанию открываем все 4 секции: category, mood, instrument, usage
  const [openSections, setOpenSections] = useState<string[]>(['category', 'mood', 'instrument', 'usage']);

  const activeCategory = searchParams.get('category__slug');
  const rawTags = searchParams.get('tags__slug');
  const activeTags = rawTags ? rawTags.split(',').filter(Boolean) : [];

  const hasActiveFilters = activeCategory || activeTags.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/tags/')
        ]);
        setCategories(catRes.data);
        const loadedTags: Tag[] = tagRes.data;
        setTags(loadedTags);

        // --- ЛОГИКА АВТО-ОТКРЫТИЯ ---
        // После загрузки тегов проверяем, есть ли активные фильтры, 
        // и если секция закрыта — открываем её принудительно.
        const sectionsToOpen = new Set(openSections);
        
        // 1. Если выбрана категория
        if (activeCategory) sectionsToOpen.add('category');

        // 2. Если выбраны теги
        activeTags.forEach(slug => {
          const tag = loadedTags.find(t => t.slug === slug);
          if (tag) {
             // tag.tag_type это 'mood', 'instrument' или 'usage'
             // Они совпадают с value наших AccordionItem
             sectionsToOpen.add(tag.tag_type);
          }
        });

        // Обновляем состояние, если что-то добавилось
        setOpenSections(Array.from(sectionsToOpen));

      } catch (e) {
        console.error('Ошибка загрузки фильтров', e);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Запускаем один раз при маунте, но логика внутри учитывает URL

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === slug) {
      params.delete('category__slug');
    } else {
      params.set('category__slug', slug);
      // При клике гарантируем, что секция останется открытой (хотя она и так открыта)
      if (!openSections.includes('category')) {
         setOpenSections(prev => [...prev, 'category']);
      }
    }
    params.delete('page');
    router.push(`/music?${params.toString()}`, { scroll: false });
    if (setMobileOpen) setMobileOpen(false);
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

    // При клике гарантируем, что секция этого типа (например, mood) будет в списке открытых
    if (!openSections.includes(type)) {
       setOpenSections(prev => [...prev, type]);
    }

    params.delete('page');
    router.push(`/music?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push('/music');
    if (setMobileOpen) setMobileOpen(false);
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
    <AccordionItem value={value} className="border-b-white/5 last:border-0">
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
                // Передаем тип тега (value секции), чтобы знать, что держать открытым
                onClick={() => handleTagFilter(tag.slug, value)} 
                className={cn(
                  "px-3 py-1 rounded-full text-xs border transition-all duration-200",
                  "text-center min-w-[30px]",
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
      
      {/* Заголовок */}
      <div className="flex items-center justify-between h-8 mb-4"> 
        <h3 className="text-lg font-bold text-white">Фильтры</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearAll}
          className={cn(
            "h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all",
            !hasActiveFilters && "opacity-0 invisible pointer-events-none"
          )}
        >
          Сбросить
        </Button>
      </div>

      {/* АККОРДЕОН (Controlled Mode) */}
      <Accordion 
        type="multiple" 
        // Используем value + onValueChange вместо defaultValue
        value={openSections}
        onValueChange={setOpenSections}
        className="w-full"
      >
        
        {/* 1. Жанры */}
        <AccordionItem value="category" className="border-b-white/5">
          <AccordionTrigger className="text-sm font-semibold text-gray-400 hover:text-white hover:no-underline py-3 uppercase tracking-wider">
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
                  onClick={() => handleCategoryFilter(cat.slug)}
                >
                  <RadioGroupItem
                    value={cat.slug}
                    id={cat.slug}
                    className="size-4 shrink-0 border-white/30 text-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <Label
                    htmlFor={cat.slug}
                    disableAnimation={true}
                    className={cn(
                      "text-sm cursor-pointer select-none w-full",
                      activeCategory === cat.slug
                        ? "text-white font-medium"
                        : "text-gray-400 group-hover:text-gray-300"
                    )}
                  >
                    {cat.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Настроение */}
        <TagGroupAccordion 
          value="mood" 
          title="Настроение" 
          items={groupedTags.mood} 
          colorClass="bg-purple-600" 
        />

        {/* 3. Инструменты */}
        <TagGroupAccordion 
          value="instrument" 
          title="Инструменты" 
          items={groupedTags.instrument} 
          colorClass="bg-blue-600" 
        />

        {/* 4. Назначение (Оно не работало, потому что его не было в списке) */}
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
      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2 custom-scrollbar">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#181818] p-6 shadow-2xl animate-in slide-in-from-right overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Фильтры</h2>
              <button onClick={() => setMobileOpen?.(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}