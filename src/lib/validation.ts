import { z } from "zod";

// Korean business number format: XXX-XX-XXXXX
const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;

// Korean phone number format: XXX-XXXX-XXXX or XXXX-XXXX
const phoneRegex = /^(\d{2,3}-\d{3,4}-\d{4}|\d{3,4}-\d{4})$/;

export const signupSchema = z.object({
  username: z
    .string()
    .min(4, "아이디는 4자 이상이어야 합니다.")
    .max(20, "아이디는 20자 이하여야 합니다.")
    .regex(/^[a-zA-Z0-9_-]+$/, "아이디는 영문, 숫자, _, -만 사용 가능합니다."),
  
  email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(255, "이메일은 255자 이하여야 합니다."),
  
  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다.")
    .max(100, "비밀번호는 100자 이하여야 합니다.")
    .regex(/[A-Za-z]/, "비밀번호는 최소 1개의 영문자를 포함해야 합니다.")
    .regex(/[0-9]/, "비밀번호는 최소 1개의 숫자를 포함해야 합니다."),
  
  passwordConfirm: z.string(),
  
  companyName: z
    .string()
    .min(1, "회사명을 입력하세요.")
    .max(100, "회사명은 100자 이하여야 합니다."),
  
  businessNumber: z
    .string()
    .regex(businessNumberRegex, "사업자번호 형식이 올바르지 않습니다. (예: 123-45-67890)"),
  
  ceoName: z
    .string()
    .min(1, "대표자명을 입력하세요.")
    .max(50, "대표자명은 50자 이하여야 합니다."),
  
  phone: z
    .string()
    .regex(phoneRegex, "전화번호 형식이 올바르지 않습니다. (예: 02-1234-5678 또는 010-1234-5678)"),
  
  address: z
    .string()
    .max(200, "주소는 200자 이하여야 합니다.")
    .optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"],
});

export type SignupFormData = z.infer<typeof signupSchema>;
