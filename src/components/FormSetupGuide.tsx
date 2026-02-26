import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Settings, Mail, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const guideSteps = [
  {
    icon: Settings,
    title: 'Tắt giới hạn 1 lần điền',
    description: 'Cho phép gửi nhiều lần từ cùng một nguồn',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    steps: [
      'Mở Google Form của bạn',
      'Click vào biểu tượng ⚙️ Cài đặt (Settings) ở góc phải',
      'Trong tab "Responses" (Phản hồi)',
      'TẮT tùy chọn "Limit to 1 response" (Giới hạn 1 câu trả lời)',
      'Đóng cửa sổ Settings để lưu',
    ],
    important: 'Nếu không tắt, mỗi người chỉ gửi được 1 lần dựa trên cookie/IP',
  },
  {
    icon: Mail,
    title: 'Không thu thập email',
    description: 'Tránh yêu cầu đăng nhập Google để gửi',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    steps: [
      'Mở Google Form → ⚙️ Cài đặt',
      'Trong tab "Responses" (Phản hồi)',
      'Tìm phần "Collect email addresses" (Thu thập địa chỉ email)',
      'Chọn "Do not collect" (Không thu thập)',
      'Hoặc nếu bắt buộc thu thập → chọn "Responder input" (Người trả lời nhập)',
    ],
    important: 'Nếu chọn "Verified", form yêu cầu đăng nhập Google → không thể tự động gửi',
  },
  {
    icon: Users,
    title: 'Không giới hạn người dùng',
    description: 'Cho phép bất kỳ ai cũng có thể truy cập',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    steps: [
      'Mở Google Form → ⚙️ Cài đặt',
      'Trong tab "Responses" (Phản hồi)',
      'TẮT "Restrict to users in [Organization]" nếu có',
      'Đảm bảo form không yêu cầu đăng nhập tổ chức',
    ],
    important: 'Form của tổ chức/trường học thường có giới hạn này',
  },
  {
    icon: Globe,
    title: 'Lấy HTML đúng cách',
    description: 'Cách copy mã nguồn HTML của form',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    steps: [
      'Mở link Google Form trong trình duyệt',
      'Nhấn Ctrl + U (Windows) hoặc Cmd + Option + U (Mac)',
      'Một tab mới sẽ mở hiển thị mã nguồn HTML',
      'Nhấn Ctrl + A để chọn tất cả',
      'Nhấn Ctrl + C để copy',
      'Dán vào ô "Mã nguồn HTML" của ứng dụng',
    ],
    important: 'Hoặc click chuột phải → "View Page Source" → Copy toàn bộ',
  },
];

export function FormSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-6 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <BookOpen className="h-5 w-5 text-warning" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Hướng dẫn cài đặt Form</div>
              <div className="text-xs text-muted-foreground">
                Cách tránh giới hạn 1 lần điền & thu thập email
              </div>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4 animate-fade-in">
        <div className="space-y-4">
          {guideSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${step.bgColor} shrink-0`}>
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="ml-0 md:ml-14 space-y-2.5">
                  {step.steps.map((stepText, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{stepIndex + 1}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{stepText}</p>
                    </div>
                  ))}
                </div>

                <div className="ml-0 md:ml-14 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-warning font-medium">{step.important}</p>
                </div>
              </div>
            );
          })}

          {/* Success summary */}
          <div className="p-5 rounded-xl gradient-primary/10 bg-success/5 border border-success/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-success">Checklist hoàn tất</h4>
                <ul className="mt-2 space-y-1.5">
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Tắt "Limit to 1 response"
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Không thu thập email hoặc chọn "Responder input"
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Không giới hạn người dùng tổ chức
                  </li>
                  <li className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Copy HTML bằng Ctrl+U → Ctrl+A → Ctrl+C
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
