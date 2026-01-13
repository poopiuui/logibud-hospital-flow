import { ArrowLeft, Heart, Shield, BookOpen, Users, Lock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Guidelines = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium text-foreground">이용 안내</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* 인트로 메시지 */}
        <Card className="memory-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-foreground">
                  소중한 추억을 지키는 약속
                </h2>
                <p className="text-muted-foreground leading-relaxed letter-text">
                  '너에게 쓰는 편지'는 반려동물과의 추억을 영원히 간직하는 공간입니다. 
                  모든 보호자님의 마음이 존중받을 수 있도록 다음의 안내를 마련했습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. 커뮤니티 가이드라인 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              커뮤니티 가이드라인
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                추모의 존엄성을 지키기 위한 약속
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">1</span>
                  <div>
                    <h4 className="font-medium text-foreground">상호 존중의 원칙</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      타인의 슬픔을 비하하거나, 반려동물의 종류를 차별하는 발언은 
                      엄격히 제재됩니다. 모든 생명은 동등하게 존중받아야 합니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">2</span>
                  <div>
                    <h4 className="font-medium text-foreground">부적절한 콘텐츠 제한</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      다른 보호자님께 불쾌감을 줄 수 있는 시각 자료는 업로드가 제한됩니다. 
                      아이의 평화로운 모습, 행복했던 순간을 담아주세요.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">3</span>
                  <div>
                    <h4 className="font-medium text-foreground">분쟁 해결 프로세스</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      악성 댓글이나 분쟁 발생 시 운영진이 24시간 내에 검토하고 
                      신속하게 조치합니다. 신고 접수 후 빠른 대응을 약속드립니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. 콘텐츠 관리 지침 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <BookOpen className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              콘텐츠 관리 지침
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                영원한 기록의 약속
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground font-medium text-center letter-text">
                  "서비스가 유지되는 한, 당신의 기록은 영구 보존됩니다"
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-secondary-foreground">📁</span>
                  <div>
                    <h4 className="font-medium text-foreground">데이터 백업 및 추출</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      추모관에 올린 글과 사진을 PDF나 포토북 형태로 언제든 
                      소장하실 수 있습니다. 소중한 기록을 실물로 간직하세요.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-secondary-foreground">🌟</span>
                  <div>
                    <h4 className="font-medium text-foreground">디지털 유산 관리</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      보호자님 사후에도 추모관이 보존될 수 있도록 신뢰할 수 있는 
                      가족에게 관리 권한을 위임하는 옵션을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. 개인정보 및 보안 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <Lock className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              개인정보 및 보안 지침
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                안전한 슬픔의 공간
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-3 w-3 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">비공개 모드 설정</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      모든 추모관을 공개할 필요는 없습니다. 가족끼리만 공유하거나 
                      나만 볼 수 있는 비공개 설정을 지원합니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-3 w-3 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">광고 배제 원칙</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      추모 공간 내에서는 어떠한 상업적 광고도 노출하지 않습니다. 
                      온전히 추억에 집중할 수 있는 공간을 약속드립니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. 온보딩 가이드 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <MessageCircle className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              사용자 온보딩 가이드
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                첫인사와 작별
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                <h4 className="font-medium text-foreground mb-2">추모관 생성 안내</h4>
                <p className="text-sm text-muted-foreground letter-text italic">
                  "아이의 이름, 생일, 그리고 가장 행복했던 순간의 사진을 
                  준비해 주세요. 천천히, 마음이 편할 때 시작하셔도 됩니다."
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h4 className="font-medium text-foreground mb-2">펫로스 증후군 케어 안내</h4>
                <p className="text-sm text-muted-foreground letter-text">
                  반려동물을 떠나보낸 후 깊은 슬픔을 느끼시는 것은 자연스러운 
                  감정입니다. 전문 상담이 필요하시다면, 펫로스 전문 상담 센터를 
                  통해 도움을 받으실 수 있습니다.
                </p>
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    🌿 한국펫로스상담센터: 02-XXX-XXXX (평일 10:00~18:00)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 마무리 메시지 */}
        <Card className="memory-card border-primary/20 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground letter-text">
              "모든 생명은 사랑받을 자격이 있고,<br />
              모든 이별은 기억될 자격이 있습니다."
            </p>
            <p className="text-sm text-muted-foreground/70 mt-4">
              — 너에게 쓰는 편지 팀 드림
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Guidelines;
