type OwnablePost = {
  created_by?: string | null
  user_id?: string | null
}

/** Instagram publishing always uses the content post owner's connection. */
export function resolveContentPostOwnerId(post: OwnablePost): string {
  return post.created_by?.trim() || post.user_id?.trim() || ""
}
