import { ArrowLeft, Heart, Shield, BookOpen, Users, Lock, MessageCircle, AlertTriangle, Infinity, Eye, Bell } from "lucide-react";
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
          <h1 className="text-lg font-medium text-foreground">서비스 이용 지침</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* 서비스의 목적 및 가치 */}
        <Card className="memory-card border-primary/20 star-glow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/15">
                <Infinity className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  서비스의 목적 및 가치
                </h2>
                <p className="text-muted-foreground leading-relaxed letter-text">
                  <strong className="text-foreground">lovable</strong>은 반려동물과의 이별을 겪은 보호자님들이 
                  슬픔을 건강하게 소화하고, 소중한 기억을 영구히 보존할 수 있도록 돕는 
                  <span className="text-primary font-medium"> 디지털 안식처</span>입니다.
                </p>
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                  "우리는 모든 생명의 존엄성을 존중하며, 이곳에서의 기록이 
                  단순한 데이터 이상의 가치를 가짐을 약속합니다."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. 커뮤니티 운영 원칙 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              커뮤니티 운영 원칙
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                추모의 존엄성을 지키기 위한 무관용 원칙
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs text-primary font-semibold">1</span>
                  <div>
                    <h4 className="font-semibold text-foreground">상호 존중</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      타인의 반려동물 종류, 크기, 이별의 방식에 대해 
                      <span className="text-destructive font-medium"> 어떠한 비하 발언도 금지</span>합니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs text-primary font-semibold">2</span>
                  <div>
                    <h4 className="font-semibold text-foreground">평화 유지</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      추모의 본질을 흐리는 상업적 홍보, 종교적 포교, 정치적 발언은 
                      <span className="text-destructive font-medium"> 즉시 삭제 및 영구 활동 정지</span> 대상입니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs text-primary font-semibold">3</span>
                  <div>
                    <h4 className="font-semibold text-foreground">콘텐츠 가이드</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      사체 사진, 사고 당시의 잔인한 묘사 등 트라우마를 유발할 수 있는 시각 자료 업로드를 제한합니다.
                      모든 기록은 <span className="text-primary font-medium">'아름다웠던 모습'</span> 위주로 권장됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. 데이터 보존 및 보안 약속 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              데이터 보존 및 보안 약속
            </h2>
          </div>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground font-normal">
                영원한 기록의 약속
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground font-semibold text-center letter-text">
                  "유저가 직접 삭제하기 전까지, 모든 추모 기록과 사진은<br />
                  lovable의 서버에 안전하게 보관됩니다"
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-accent-foreground" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground">프라이버시 컨트롤</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      모든 추모관은 <span className="font-medium text-foreground">[전체 공개 / 친구 공개 / 비공개]</span> 설정을 통해 
                      보호자가 원하는 범위 내에서만 공유될 수 있습니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-sm">📁</span>
                  <div>
                    <h4 className="font-semibold text-foreground">데이터 백업 및 추출</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      추모관에 올린 글과 사진을 PDF나 포토북 형태로 언제든 
                      소장하실 수 있습니다. 소중한 기록을 실물로 간직하세요.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-sm">🌟</span>
                  <div>
                    <h4 className="font-semibold text-foreground">디지털 유산 관리</h4>
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

        {/* 3. 악성 유저 관리 정책 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/15">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              악성 유저 관리 정책
            </h2>
          </div>
          <Card className="border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-destructive/80 font-normal">
                무관용 원칙 (Zero Tolerance)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground letter-text">
                    <span className="font-medium text-foreground">실시간 모니터링:</span> 
                    특정 키워드 필터링 시스템 가동
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground letter-text">
                    <span className="font-medium text-foreground">신고 처리 프로세스:</span> 
                    부적절한 댓글 작성 시, 신고 3회 누적 전이라도 운영진 판단하에 즉시 계정 정지
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground letter-text">
                    <span className="font-medium text-foreground">초상권 및 저작권:</span> 
                    타인의 반려동물 사진을 무단 도용하여 추모관을 생성할 경우 법적 조치 및 즉시 삭제
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. 개인정보 및 보안 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Lock className="h-5 w-5 text-primary" />
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
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground">비공개 모드 설정</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      모든 추모관을 공개할 필요는 없습니다. 가족끼리만 공유하거나 
                      나만 볼 수 있는 비공개 설정을 지원합니다.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <Heart className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground">광고 배제 원칙</h4>
                    <p className="text-sm text-muted-foreground mt-1 letter-text">
                      추모 공간 내에서는 <span className="font-medium text-foreground">어떠한 상업적 광고도 노출하지 않습니다.</span> 
                      온전히 추억에 집중할 수 있는 공간을 약속드립니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 5. 온보딩 가이드 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <MessageCircle className="h-5 w-5 text-primary" />
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
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                <h4 className="font-semibold text-foreground mb-2">추모관 생성 안내</h4>
                <p className="text-sm text-muted-foreground letter-text italic">
                  "아이의 이름, 생일, 그리고 가장 행복했던 순간의 사진을 
                  준비해 주세요. 천천히, 마음이 편할 때 시작하셔도 됩니다."
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  펫로스 증후군 케어 안내
                </h4>
                <p className="text-sm text-muted-foreground letter-text">
                  반려동물을 떠나보낸 후 깊은 슬픔을 느끼시는 것은 자연스러운 
                  감정입니다. 전문 상담이 필요하시다면, 펫로스 전문 상담 센터를 
                  통해 도움을 받으실 수 있습니다.
                </p>
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    🌿 한국펫로스상담센터 (평일 10:00~18:00)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 마무리 메시지 */}
        <Card className="memory-card border-primary/30 bg-gradient-to-br from-background via-accent/10 to-primary/10 star-glow">
          <CardContent className="pt-8 pb-8 text-center">
            <Infinity className="w-8 h-8 text-primary mx-auto mb-4 opacity-60" />
            <p className="text-foreground font-medium letter-text">
              "모든 생명은 사랑받을 자격이 있고,<br />
              모든 이별은 기억될 자격이 있습니다."
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              — lovable 팀 드림
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Guidelines;