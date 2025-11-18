import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PRODUCT_CATEGORIES } from "@/data/categories";

interface Category {
  code: string;
  name: string;
  description?: string;
  productCount: number;
}

export default function CategoryManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>(
    PRODUCT_CATEGORIES.map(cat => ({
      code: cat.code,
      name: cat.name,
      description: cat.description || `${cat.name} 관련 제품`,
      productCount: Math.floor(Math.random() * 50)
    }))
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: ""
  });

  const handleAddCategory = () => {
    if (!formData.code || !formData.name) {
      toast({
        title: "입력 오류",
        description: "카테고리 코드와 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const newCategory: Category = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      productCount: 0
    };

    setCategories([...categories, newCategory]);
    toast({
      title: "카테고리 추가",
      description: `${formData.name} 카테고리가 추가되었습니다.`
    });

    setIsAddDialogOpen(false);
    setFormData({ code: "", name: "", description: "" });
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;

    setCategories(categories.map(cat =>
      cat.code === selectedCategory.code ? { ...selectedCategory, ...formData } : cat
    ));

    toast({
      title: "카테고리 수정",
      description: `${formData.name} 카테고리가 수정되었습니다.`
    });

    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    setFormData({ code: "", name: "", description: "" });
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.productCount > 0) {
      toast({
        title: "삭제 불가",
        description: "제품이 등록된 카테고리는 삭제할 수 없습니다.",
        variant: "destructive"
      });
      return;
    }

    setCategories(categories.filter(cat => cat.code !== category.code));
    toast({
      title: "카테고리 삭제",
      description: `${category.name} 카테고리가 삭제되었습니다.`
    });
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || ""
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">카테고리 등록</h1>
              <p className="text-muted-foreground mt-1">제품 카테고리를 관리합니다</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FolderTree className="w-6 h-6" />
                  카테고리 목록
                </CardTitle>
                <CardDescription className="mt-2">
                  총 {categories.length}개의 카테고리
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                카테고리 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">카테고리 코드</TableHead>
                    <TableHead className="font-bold">카테고리명</TableHead>
                    <TableHead className="font-bold">설명</TableHead>
                    <TableHead className="font-bold">등록 제품 수</TableHead>
                    <TableHead className="font-bold text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.code}>
                      <TableCell className="font-mono font-semibold">
                        <Badge variant="outline">{category.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.productCount}개</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={category.productCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 추가 Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
            <DialogDescription>
              새로운 제품 카테고리를 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">카테고리 코드 *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="예: CAT001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">카테고리명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 의료소모품"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="카테고리 설명"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
            <Button onClick={handleAddCategory}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
            <DialogDescription>
              카테고리 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-code">카테고리 코드</Label>
              <Input
                id="edit-code"
                value={formData.code}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">카테고리명 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">설명</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
            <Button onClick={handleEditCategory}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
