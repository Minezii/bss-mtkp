'use client';

import { useState, useEffect } from 'react';
import { Search, Book, FileText, Download, Filter, GraduationCap, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const courses = [1, 2, 3, 4];

export default function StudentsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/materials?course=${selectedCourse}`);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse]);

  const filteredMaterials = materials.filter((m) => {
    return m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 md:p-16 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            ╨Т╤Б╨╡ ╨╖╨╜╨░╨╜╨╕╤П ╨▓ ╨╛╨┤╨╜╨╛╨╝ ╨╝╨╡╤Б╤В╨╡
          </h1>
          <p className="text-base md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            ╨С╨░╨╖╨░ ╨║╨╛╨╜╤Б╨┐╨╡╨║╤В╨╛╨▓, ╨╗╨╡╨║╤Ж╨╕╨╣ ╨╕ ╤Г╤З╨╡╨▒╨╜╤Л╤Е ╨╝╨░╤В╨╡╤А╨╕╨░╨╗╨╛╨▓ ╨┤╨╗╤П ╤Б╤В╤Г╨┤╨╡╨╜╤В╨╛╨▓ ╨Ь╨в╨Ъ╨Я.
            ╨б╨║╨░╤З╨╕╨▓╨░╨╣, ╨┤╨╡╨╗╨╕╤Б╤М ╨╕ ╤Г╤З╨╕╤Б╤М ╤Н╤Д╤Д╨╡╨║╤В╨╕╨▓╨╜╨╡╨╡.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push('/submit?type=material')}
              className="w-full sm:w-auto bg-primary-foreground text-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg active:scale-95"
            >
              ╨Я╤А╨╡╨┤╨╗╨╛╨╢╨╕╤В╤М ╤Б╨▓╨╛╨╣
            </button>
          </div>
        </div>
        <div className="absolute right-[-10%] bottom-[-10%] md:bottom-[-20%] opacity-10 pointer-events-none">
          <GraduationCap size={300} className="md:w-[400px] md:h-[400px]" />
        </div>
      </section>

      {/* Filters & Search */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCourse('all')}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedCourse === 'all'
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-secondary text-secondary-foreground hover:bg-muted active:scale-95'
                }`}
            >
              ╨Т╤Б╨╡ ╨║╤Г╤А╤Б╤Л
            </button>
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedCourse === course
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted active:scale-95'
                  }`}
              >
                {course} ╨║╤Г╤А╤Б
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="╨Я╨╛╨╕╤Б╨║ ╨┐╨╛ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary transition-all text-foreground outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted-foreground group">
            <RefreshCcw size={48} className="animate-spin mb-4" />
            <p className="font-bold">╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨╖╨╜╨░╨╜╨╕╤П...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.fileUrl) {
                    window.open(item.fileUrl, '_blank');
                  } else {
                    alert('╨д╨░╨╣╨╗ ╨╡╤Й╨╡ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜ ╨╕╨╗╨╕ ╤Б╤Б╤Л╨╗╨║╨░ ╨╛╤В╤Б╤Г╤В╤Б╤В╨▓╤Г╨╡╤В.');
                  }
                }}
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-secondary rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  ╨Я╤А╨╡╨┤╨╝╨╡╤В: <span className="text-foreground font-medium">{item.subject}</span>
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-sm font-semibold flex items-center gap-1 text-muted-foreground">
                    <Download size={16} />
                    {item.downloads}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {item.course} ╨║╤Г╤А╤Б
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-24 bg-secondary/50 rounded-3xl border-2 border-dashed border-border">
            <p className="text-muted-foreground text-lg">╨Я╨╛ ╨▓╨░╤И╨╡╨╝╤Г ╨╖╨░╨┐╤А╨╛╤Б╤Г ╨╜╨╕╤З╨╡╨│╨╛ ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜╨╛.</p>
          </div>
        )}
      </section>
    </div>
  );
}
