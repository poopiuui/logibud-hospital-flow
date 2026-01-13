import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Feather, Heart, BookOpen, Star } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur">
    <CardContent className="p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Feather className="w-6 h-6 text-primary" />
          <span className="text-lg font-medium text-foreground">너에게 쓰는 편지</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">로그인</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm">시작하기</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-8">✉️</div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground leading-tight">
            함께했던 시간들을<br />
            <span className="text-primary">편지로 간직해요</span>
          </h1>
          <p className="text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto">
            소중했던 순간들, 전하지 못한 마음들을<br />
            이 곳에 조용히 남겨두세요
          </p>
          <Link to="/auth">
            <Button size="lg" className="px-8">
              시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Quote */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-muted-foreground italic text-sm leading-relaxed">
            "네가 떠나고 나서야 알았어.<br />
            네가 얼마나 많은 것을 남겨줬는지."
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={Feather}
            title="편지 쓰기"
            description="전하지 못한 마음을 편지로 남겨요"
          />
          <FeatureCard
            icon={BookOpen}
            title="추억 타임라인"
            description="함께한 순간들을 시간순으로 되돌아봐요"
          />
          <FeatureCard
            icon={Heart}
            title="사진 간직하기"
            description="소중한 순간들을 사진으로 담아요"
          />
          <FeatureCard
            icon={Star}
            title="조용한 추모"
            description="나만의 공간에서 조용히 기억해요"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-accent/20 border-none p-8 md:p-12 max-w-xl mx-auto">
          <p className="text-foreground mb-6 leading-relaxed">
            언제든, 보고싶을 때<br />
            이 곳에서 너를 만날 수 있어
          </p>
          <Link to="/auth">
            <Button variant="outline">편지 쓰러 가기</Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm border-t border-border/50">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link to="/guidelines" className="hover:text-foreground transition-colors">
            이용 안내
          </Link>
          <span className="text-border">|</span>
          <Link to="/memorial" className="hover:text-foreground transition-colors">
            추모 공간
          </Link>
        </div>
        <p>© 2024 너에게 쓰는 편지</p>
        <p className="text-xs mt-1 opacity-70">영원히 기억될 거야</p>
      </footer>
    </div>
  );
};

export default Landing;