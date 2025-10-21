import prisma from '@lib/prisma';

export type CommentNode = {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  children: CommentNode[];
};

type PrismaComment = Awaited<ReturnType<typeof prisma.comment.findMany>>[number];

type CommentQueryResult = {
  flat: CommentNode[];
  nested: CommentNode[];
};

export const loadCommentsForArticle = async (articleId: string): Promise<CommentQueryResult> => {
  if (!articleId) {
    return { flat: [], nested: [] };
  }

  const commentsData = await prisma.comment.findMany({
    where: {
      articleId,
      status: 'approved',
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
  });

  const flat = commentsData.map((comment: PrismaComment) => ({
    id: comment.id,
    authorName: comment.authorName ?? 'Anonyme',
    authorEmail: comment.authorEmail ?? '',
    content: comment.content ?? '',
    createdAt: (comment.createdAt ?? new Date()).toISOString(),
    parentCommentId: comment.parentCommentId ?? null,
    children: [] as CommentNode[],
  }));

  const map = new Map<string, CommentNode>();
  flat.forEach((comment: CommentNode) => map.set(comment.id, comment));

  const nested: CommentNode[] = [];
  flat.forEach((comment: CommentNode) => {
    if (!comment.parentCommentId) {
      nested.push(comment);
      return;
    }
    const parent = map.get(comment.parentCommentId);
    if (parent) {
      parent.children.push(comment);
    } else {
      nested.push(comment);
    }
  });

  return { flat, nested };
};