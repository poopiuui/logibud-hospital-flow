import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Heart, Users, Star } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur">
    <CardContent className="p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-primary">펫라이프</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost">로그인</Button>
          </Link>
          <Link to="/auth">
            <Button>시작하기</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-6xl mb-6 animate-float">🐶🐱</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            반려동물과의 소중한 순간을<br />기록하세요
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            사진 앨범, 성장 기록, 추억 공유까지<br />
            반려동물과의 모든 순간을 담아보세요
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={Camera}
            title="사진 앨범"
            description="날짜별, 기분별로 사진을 정리하고 소중한 순간을 간직하세요"
          />
          <FeatureCard
            icon={Heart}
            title="성장 기록"
            description="반려동물의 건강, 용품, 일상을 체계적으로 관리하세요"
          />
          <FeatureCard
            icon={Users}
            title="자랑 게시판"
            description="귀여운 반려동물 사진을 공유하고 다른 반려인들과 소통하세요"
          />
          <FeatureCard
            icon={Star}
            title="추모 공간"
            description="무지개다리를 건넌 아이들을 위한 온라인 추모 공간"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-none p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            지금 바로 시작해보세요! 🎉
          </h2>
          <p className="text-muted-foreground mb-6">
            무료로 가입하고 반려동물과의 추억을 기록하세요
          </p>
          <Link to="/auth">
            <Button size="lg">가입하기</Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm border-t">
        <p>© 2024 펫라이프. 모든 반려동물을 사랑합니다 🐾</p>
      </footer>
    </div>
  );
};

export default Landing;
