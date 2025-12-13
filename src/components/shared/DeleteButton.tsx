'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  entryId: string;
  apiPath: string;
  redirectPath: string;
  onDelete?: () => void;
}

export function DeleteButton({ entryId, apiPath, redirectPath, onDelete }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/${apiPath}/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 중 오류가 발생했습니다.');
      }

      if (onDelete) {
        onDelete();
      } else {
        // revalidatePath가 적용되도록 약간의 지연 후 리다이렉트
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 100);
      }
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(error.message || '삭제 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}

