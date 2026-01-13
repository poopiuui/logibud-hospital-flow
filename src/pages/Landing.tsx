import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flower2, Heart, BookOpen, Star, PenLine, MessageCircle, MapPin, Infinity } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <Card className="border-none shadow-sm card-hover bg-card/90 backdrop-blur">
    <CardContent className="p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const ActionButton = ({ icon: Icon, label, description }: { icon: any; label: string; description: string }) => (
  <div className="action-button p-5 text-center cursor-pointer group">
    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h4 className="font-medium text-foreground mb-1">{label}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Infinity className="w-7 h-7 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
          </div>
          <span className="text-lg font-semibold text-foreground">lovable</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground">로그인</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm">시작하기</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - 40% 메인 메모리얼 영역 */}
      <section className="hero-gradient">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            {/* 로고 심볼 - 발바닥 + 무한대 */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary/10 rounded-full star-glow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl">🐾</span>
              </div>
              <Infinity className="absolute -bottom-1 -right-1 w-8 h-8 text-primary opacity-70" />
            </div>
            
            <p className="text-sm text-primary font-medium mb-4 tracking-wide">
              영원한 사랑의 연결
            </p>
            
            <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground leading-tight">
              보고 싶은 <span className="text-primary">너</span>에게,<br />
              오늘도 사랑해
            </h1>
            
            <p className="text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto letter-text">
              함께했던 모든 순간들을<br />
              이 곳에 영원히 간직하세요
            </p>
            
            <Link to="/auth">
              <Button size="lg" className="px-10 rounded-full shadow-lg">
                추모관 만들기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interaction Bar - 핵심 인터랙션 버튼 */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <Card className="max-w-xl mx-auto border-primary/20 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <ActionButton 
                icon={Flower2} 
                label="헌화하기" 
                description="꽃을 바쳐요"
              />
              <ActionButton 
                icon={PenLine} 
                label="편지쓰기" 
                description="마음을 전해요"
              />
              <ActionButton 
                icon={Heart} 
                label="간식주기" 
                description="사랑을 담아요"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quote */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-muted-foreground italic text-sm leading-relaxed letter-text">
            "네가 떠나고 나서야 알았어.<br />
            네가 얼마나 많은 것을 남겨줬는지."
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-center text-xl font-semibold mb-8 text-foreground">
          소중한 기억을 위한 공간
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={PenLine}
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

      {/* Care Section - 위로의 연결 */}
      <section className="container mx-auto px-4 py-12">
        <Card className="care-section border-none max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-center text-lg font-semibold mb-6 text-foreground">
              위로의 연결
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/guidelines" className="group">
                <Card className="border-primary/10 bg-card/80 card-hover h-full">
                  <CardContent className="p-5 text-center">
                    <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-foreground mb-1">펫로스 상담소</h4>
                    <p className="text-xs text-muted-foreground">전문 상담 안내</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/memorial" className="group">
                <Card className="border-primary/10 bg-card/80 card-hover h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-foreground mb-1">근처 추모공원</h4>
                    <p className="text-xs text-muted-foreground">장소 정보 연결</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/showcase" className="group">
                <Card className="border-primary/10 bg-card/80 card-hover h-full">
                  <CardContent className="p-5 text-center">
                    <Star className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-foreground mb-1">무지개다리 이야기</h4>
                    <p className="text-xs text-muted-foreground">커뮤니티</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 text-center">
        <Card className="bg-gradient-to-br from-accent/30 via-primary/10 to-accent/30 border-primary/20 p-8 md:p-12 max-w-xl mx-auto star-glow">
          <Infinity className="w-10 h-10 text-primary mx-auto mb-4 opacity-60" />
          <p className="text-foreground font-medium mb-6 leading-relaxed letter-text">
            언제든, 보고싶을 때<br />
            이 곳에서 너를 만날 수 있어
          </p>
          <Link to="/auth">
            <Button variant="outline" className="rounded-full px-8">편지 쓰러 가기</Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm border-t border-border/50">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link to="/guidelines" className="hover:text-primary transition-colors">
            이용 안내
          </Link>
          <span className="text-border">|</span>
          <Link to="/memorial" className="hover:text-primary transition-colors">
            추모 공간
          </Link>
          <span className="text-border">|</span>
          <Link to="/showcase" className="hover:text-primary transition-colors">
            커뮤니티
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Infinity className="w-4 h-4 text-primary/50" />
          <p className="font-medium">lovable</p>
        </div>
        <p className="text-xs opacity-70">영원한 사랑, 영원한 기억</p>
      </footer>
    </div>
  );
};

export default Landing;