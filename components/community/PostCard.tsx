import { Post } from "@/services/postServices";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ThumbsUp, MessageSquare, Flag, Pencil } from "lucide-react";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  formatRelativeTime: (dateString: string) => string;
}

export function PostCard({ post, onLike, formatRelativeTime }: PostCardProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4 md:p-6 flex flex-col gap-1">
      <div className="flex gap-4">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border border-gray-300">
            <AvatarImage src={post.created_by.avatar || undefined} alt={post.created_by.name} />
            <AvatarFallback>{post.created_by.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm md:text-base">{post.created_by.name}</span>
              <span className="text-base text-gray-500">• {formatRelativeTime(post.created_at)}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-900 hover:text-gray-900">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <Link href={`/community/all-post/${post.id}`} className="block hover:opacity-80 transition-opacity mb-3">
            {post.title && (
              <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1">{post.title}</h3>
            )}
            <p className="text-gray-700 leading-relaxed text-sm md:text-base line-clamp-3">
              {post.content}
            </p>
          </Link>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {post.tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-green-50 text-green-700 hover:bg-green-100 text-base font-normal"
                  style={{ backgroundColor: tag.color_code ? `${tag.color_code}20` : undefined }}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
        <div className="flex gap-4 md:gap-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-900 hover:text-green-600 hover:bg-green-50 gap-1.5 px-2 -ml-2"
            onClick={() => onLike(post.id)}
          >
            <ThumbsUp className="h-6 w-6" />
            <span className="text-base font-medium">{post.likes_count} Likes</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-900 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-base font-medium">{post.comments_count} Comments</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 px-2">
            <Flag className="h-6 w-6" />
            <span className="text-base font-medium">Report</span>
          </Button>
        </div>
        <Link href={`/community/all-post/${post.id}`}>
          <Button variant="ghost" size="sm" className="text-black hover:text-gray-900 font-medium text-base">
            Reply
          </Button>
        </Link>
      </div>
    </Card>
  );
}
