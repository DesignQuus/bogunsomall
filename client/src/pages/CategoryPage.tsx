"use client";

/*
 * Design: "Clean Canvas" — Apple Store Style
 * - Product cards with sample images (like bogunsoplus.com)
 * - Breadcrumb navigation
 * - Subcategory filters + sort filter bar
 */

import { useEffect, useState, useRef, Fragment } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ArrowRight, ChevronRight, ChevronLeft, RefreshCw, Edit3, X, CheckCircle2, Phone, Building2, User, Briefcase, Search, LayoutGrid, List } from "lucide-react";
import { categories } from "@/data/categories";
import type { SubCategory } from "@/data/categories";



// Find category by id (either parent or sub)
function findCategory(id: string) {
  const parent = categories.find((c: { id: string }) => c.id === id);
  if (parent) return { parent, sub: null };
  for (const cat of categories) {
    const sub = cat.sub.find((s: SubCategory) => s.id === id);
    if (sub) return { parent: cat, sub };
  }
  return null;
}

// Product images for each category and subcategory
const productImages: Record<string, string[]> = {
  "1010": [
    // 베스트: 소프트, 프리미엄두꺼운, 크림매트 (기존 이미지 재활용)
    "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/CWClslvoCCszVPeBOOeuZo-img-1_1771721578000_na1fn_Y2FyZC1maWxhcmUtdjI.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0NXQ2xzbHZvQ0NzelZQZUJPT2V1Wm8taW1nLTFfMTc3MTcyMTU3ODAwMF9uYTFmbl9ZMkZ5WkMxbWFXeGhjbVV0ZGpJLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=nMHnsBkmxwjZY1Y5jIoF6hWtYdtQmDd7H50iIrWS3UJKtGTnvW9eC7bRElMElo1rEwvlrFYTYttVOJz92kk0VNVz3XNUEcWtWq-WZh1Te53Gcl5eitoi6HflBgqszoYANprFTDB8hOmHD7zSYyyLSteCx7DTOFXV1inwy4zwz2IZXCXqCYi0FuP~ZNrGYrQ700ZDzpgE4jNkdlL2PnzcSXR-pA80Ctgj~81XQBqnqiwLvFFs~vRX4VH~ctrQWp9ChZMtEdUlVMj2XeZhybza0MUpxs6n0djDswqBDybsn3wAKn-dx6boxVtxuu9z-Iywn0TwyRCVM8DOz-liPoV7qg__",
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/aaWpnqkcBtbQLlTf.jpg?Expires=1803263641&Signature=oJ0ko6LB5h6~BM3mhlwMV7lLCTGxnB2lLrXZGtrv6BR9tWaw7zpRVdGxJiaoTlfHJgmY7AsMNQM6-lxK7KjtrkWdg0Ied6ulBS4qQ~tDAyT2lDXBAn6dTn~sDImH-KpWrihPNK4JMMEl9-AT691cnjVeYisCg5onf9IXHe7TWlyzHF43anccEa7GUZBJqQzzSHai6B1J1rgcetuAIPZPfpWeN6hOYzr~tCGKegbv0kcy4gmICm5GKzLMGkj5bgOMSuSB2OHEscXimp1qlUj0ZgI~3PewqPMfgtLPVXdCEF0y16X1x2ho75DAhm4BsHK-Xx1nKgXJO-QrEqmUtju7WA__&Key-Pair-Id=K2HSFNDJXOU9YS",
    "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/CWClslvoCCszVPeBOOeuZo-img-3_1771721570000_na1fn_Y2FyZC1tYXJzaG1hbGxvdy12Mg.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0NXQ2xzbHZvQ0NzelZQZUJPT2V1Wm8taW1nLTNfMTc3MTcyMTU3MDAwMF9uYTFmbl9ZMkZ5WkMxdFlYSnphRzFoYkd4dmR5MTJNZy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DK1pJNKTq8njD~37ETwXBxZl0sj8uK65bPifH7YopXSeK5jCMnFvOsGY1ttMYVisQVw9tJ35Kjs5rRtImxhc5Yi~3LFHTfFV0Mf39tKcyIsLl63AKtHUqQNI~GN4jhbHs39cKoenhAvFpAIoL104n6L1eHLgzpQHZVCyTFnQS6w7sqnrLBPFlZ84wmHJ2nRcg22smKNYBq~HbmUSZL~-bDX3dOVVKTcmgzvpdPveAiTdQiWro88PP2S398jBZ~X4ErF6mdJ7IYnIJSAqrtmY6KrD~vwrh1Jz6yzxqkNeDtmRAayzN37bneD0EUnXh3G-Fq~sU1ur~CtV~Vsby7o-cA__",
  ],
  "1020": [
    // Masonry 레이아웃용 예시 이미지 30개
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-01-nAWF4nwLwy7mtDDuAgtMwS.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-02-JWYbphVDNoy3v3vcZpgPY8.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-03-2xePnVUvxM9M5NSdYWHLij.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-04-6eA3LmDHbGk65LKcvDoufZ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-05-WvbuEHxepPfpGAVqxkE2Vu.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-06-LZ46BLBi7a4pJZ9wtGsNui.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-07-NnGbbio4wYN2mwjwsfP9nd.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-08-nKKxTbpP5c6VA2e4haRqsV.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-09-A6oweMLFjvJRuvcqy3gzcy.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-10-SeWckAoA8UXF9GZu2kaJYG.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-11-QoSTTamD7nSWvQ8VPgf3du.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-12-AmZHqSo4YHoyWhqSLL6bxt.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-13-aNwVPEyrCRVvkWF8mkRTPb.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-14-22SovgdQjaxEcJZmrsYcqt.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-15-Mpx5EhbGydsxVhRbGZ4LLu.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-16-FFg7gWz5WXrtibiZ8QsSQQ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-17-94iAv2AQQdvJWit4naW8tb.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-18-CW64mti7TZhpYmh6Bc4TFS.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-19-g7etczKZrvZd2xAEduYmKg.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-20-52Erh57PFDFkeoDCNk72k4.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-21-26tn3HizvJWsAH2ntJxjuk.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-22-dHgTUjGMF7qmZoLXLUgkRN.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-23-EHdpC9Q3dNqS6YztCuX6m4.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-24-PAQj7arhDFnLaxr2qVjZq9.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-25-DZBDZEEVeA9y23HmSGwXhx.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-26-MH9oTc8DDRYsLRkZR9c4oh.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-27-KxqnuK4v5RK6iQVRT9Cg54.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-28-ED8DsLXa5mSGRnKCoC5FSo.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-29-3nJMc2g4T8PRekVSpwW8TQ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-30-Ha9L4j45vZ9rR8uL2VK2H8.png",
  ],
  "1030": [
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/MQzUVagPKfqtwTfG.jpg?Expires=1803264757&Signature=pcsZqapluM2C-JcqjLkE4qKpbrWXMy12htdcbabkmPPipZN9-xrai99Q5-FxaoAWhR4ETgJ6NxRS0-NMZmGUWgm8rLyxiilvBsY6ACvVxNGV-U~gTmKIe1yyEBm3aRA8~FbehuvmylWrfPW95ytzT8s4tEoSZC7DYxIn~ieLxNy3se2uJlMHaXTU~t2S1YTNDbmqurFkzDDcvSn5fuJ2excuGcxRwSfJgEomXPAEnl1bk3GMI5BRRFqPTwBOqEsRXi-C0NNp6LbEbR6liFhu56zPqKUhy51ay6I14o8YzlyEhtDUg~d1ApFPGljNn5idCo7C67BOHAUZx2oPJikqzQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/RggGBvscYdBuSoTl.jpg?Expires=1803264757&Signature=RUcH4ijHc54h11JWJZrzZ6nw4~LBULXnOvIAIvqUV8RoYyfpS6yq-cgvLp8dVYI7KmHD7S9a0VhMe1WVf5F9wug-ljnk2fBcE0bh6l7ngqARYUEHn7qh0T8MjJ2IpzLifrYweiqNvdV6XDxxQkvALogTn4LatfY3fE3VV37ciR1GI~4rQil0oFC4obuKNlGWtaKlHtWz3UtAxpqHUi0zfPnBeYlc8SR7xp~r~ChlDxXTLzf~AdxO6xdj6wCmAPCcXkyIve1AXInhCiuuKII34cXUmoP-B39o6pD1djVguki4Cma54Wc66MyqCsRfMYXjrHVomPvanDT631y8Uz6HtQ__&Key-Pair-Id=K2HSFNDJXOU9YS",
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/OfIXuEHvcVNbvqHr.jpg?Expires=1803264757&Signature=h5PHhy~zghAI-wUvWvxW2zhmeQGIw4dGGMM2GDPYMS8GKwH6VzodV1OoIEzt5v054WlvF3A-RX7pwOLn~bSOTVVF8uznskwK~bl43vsGdlm2VS7rL8iXUhhD4xNqpB5jUSSEOiW7x67qAFcsElzDmA6p9GBX9~hGCqfhxUq0gB-HEprPRdUfdNMQ-W4p8JdrWbl5o-js4yq36i3hyhA6QERUh8bk4gd1iMh1Rd5vpgY0wXxvSIjGnogOFqr1n1HESKh1dZt6ozvrPKcXKQOYwFdXN7ndYbpBGPnFGNmDqEh653eEhG192cVja18JCUamXfKl2cndrej7RAvDXvBmbw__&Key-Pair-Id=K2HSFNDJXOU9YS",
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/WqvlximImGlWtFNH.jpg?Expires=1803264757&Signature=lBtPto~1q~w9hvLfR7mC~wp8vwCxs8dSZP~KMV61bvlQtteEr3nLy0N5cUT0fQBqVH~2Z9wemykStaDjVt8NmccTYk~6dByin4~akpCq~t7p~m7XwSm7ydGrL49eBNYyvm0gqCDr7pDxDQ045a55ajQ5fb3xPmtou8-bl8BmcsYcJxM9b~1jZtktNQXJqhLeacwuCDGKykhDZ6mJJyYzfSf5rJcKI~uWZgvOf5QzRnmyFV9mf2a246tLY5hp4-ATxswG~Rabfb9GpvzNkXw~ClmE4VCjlglYNSioIkOrMHZY37vnFQ-PgyGwbvrHZCl0R6-v~fFHS0DVmKgcXHiDFg__&Key-Pair-Id=K2HSFNDJXOU9YS",
  ],
  "1040": [
    // 친환경 2종: 에코, 크라프트
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/hUGxNdntUyACMnoY.jpg?Expires=1803264480&Signature=u9~GteUCfKlqnS98RzYuTL6TozSjzLdeh1J2UkIVOePHfvdQBXpBqu2Ia48VDqL775H8qbIg-L62HaGXvsOyUWz3kgn4Mmag~ctO8Qz9VJEfBmfTFZEw6RCPJTI~mCVMOygeVhMfm2OR85qwlsoCm2FVLSfTmgGzZqAx0cw8qnjMeiuUy1Msvy-5flCmHfF7tyPIdewKgkG~03sVFwLO49g4vQxBZQPINPIsf1Ew8nkye-4sK2rvtiuX5ylWNlNJMiZSWgO5g4CVXQRarNuaxqAcysazTSRV6h8vf-ijYAIxyJoDYdOUCJJhVl~7V-31T1M172FDsg534SvjtnlSqw__&Key-Pair-Id=K2HSFNDJXOU9YS",
    "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/310519663165221107/tEbwKPyNlAkVifhu.jpg?Expires=1803264480&Signature=rcjrTpcF3vF9ZThL9b7jayTwXiqif8iB~KsztU-o2g2wDrxbqqNN39I0sfAmnSHJqBwY4L2fEUV7exxKf3s8ROpitIi5wi4m5HhTZ9QY3WOBXRqT4g435mLGdxxDOmuRNX6XoFb0Sqh9RgF0cqFBHVGth6mnubSkhYLFGAuF1jQ4B40D1myuR4NyLr-WpZ9T5kkT0eUhohKePaJuFYQzjwZkJAiUBN~ntreaeSvzOyn1ipnsgQnERDU7du1qbamlj0oHV4jnPygQ9GDmzBXWNAiO71lcHP9bQT0Y-PH5DldMWVeE7PG8PNmcEpC~YNOzXXG-1jpOt1UXhFXVnDpofg__&Key-Pair-Id=K2HSFNDJXOU9YS",
  ],
  "10": [
    // A형 (idx 0)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-A형_6c9613ad_547857c6.webp",
    // B형 (idx 1)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-B형_503c21d0_523aa825.webp",
    // C형 (idx 2)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-C형_ab63ca48_45d43c24.webp",
    // D형 (idx 3)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-D형_2091e758_5ce12241.webp",
    // E형 (idx 4)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-E형_58183f4a_81e8e8ee.webp",
    // F형 (idx 5)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-F형_d3102d40_af657f8f.webp",
    // G형 (idx 6)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-G형_fad0bc70_31e8005a.webp",
    // H형 (idx 7)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-H형_aa45c00a_86d18f79.webp",
  ],
  "promo-poster": [
    // 0: 금연지원서비스 포스터 (2022)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연포스터_금연지원서비스_210_297copy-복사본_919bcd22_7be633fc.webp",
    // 1: 아파트 금연구역 포스터 (2022)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연포스터_아파트_210_297copy-복사본_3b7bf019_65c3db61.webp",
    // 2: 유아시설 금연구역 포스터 (2022)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연포스터_유아시설_210_297copy-복사본_27e1a8e1_eb4bc35d.webp",
    // 3: 학교 금연구역 포스터 (2022)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연포스터_학교_210_297copy-복사본_205d82e9_da6aa870.webp",
    // 4: 2024년 포스터 세로형
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/4.포스터(세로형)-복사본_4bc2258f.jpg",
    // 5: 2024년 포스터 가로형
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/4.포스터(가로형)-복사본_7b5289d5.jpg",
    // 6: 제35회 세계 금연의날 포스터 (2022)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/2_포스터_세계금연의날-복사본_3b64304b.webp",
  ],
  "promo-leaflet": [
    // 0: 궐련형 전자담배 리플렛 (2018)
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/[웹용]궐련형전자담배(가열담배)_리플렛_420x160-복사본_841fcf55.webp",
  ],
  "4050": [
    // 0: 머그컵
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
    // 1: 수첩/다이어리
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop",
    // 2: 에코백
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    // 3: 텀블러
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    // 4: 배지/핀버튼 - 금연성공 배지 세트
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/smoking-success-badge-set_d7972868.png",
    // 5: 타월/손수건
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
  ],
  "sticker-general": [
    // 나노바나나 생성 스티커 이미지 30개
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-01_e285b806.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-02_08556ccf.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-03_2a9b6a74.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-04_99c00617.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-05_26f9ca29.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-06_2dcb83eb.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-07_f6512c3b.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-08_58789577.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-09_8f833dc3.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-10_bfd5132b.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-11_9f53a9e0.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-12_1dd3c0f2.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-13_f472bdd3.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-14_7a7b4795.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-15_055b616f.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-16_8741bbab.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-17_59e58e6b.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-18_40d8132f.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-19_169a8b3e.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-20_c06da9f5.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-21_95a37b1f.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-22_b00cee5c.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-23_b7bb89b3.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-24_e6b90531.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-25_f3330d88.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-26_bf947393.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-27_7b43e764.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-28_59f018e6.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-29_38feb7f9.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-30_538861ce.png",
  ],
  "sticker-special": [
    // 0: 스티커 유치원어린이집
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/1.스티커(유치원어린이집)-복사본_230007bf.webp",
    // 1: 스티커 유치원어린이집 지자체로고용
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/1.스티커(유치원어린이집)_지자체로고용-복사본_312e68e9.webp",
    // 2: 스티커 초중고교
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/1.스티커(초중고교)-복사본_3149648c.webp",
    // 3: 스티커 초중고교 지자체로고용
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/1.스티커(초중고교)_지자체로고용-복사본_af4496a9.webp",
  ],
  "sticker": [
    // Masonry 레이아웃용 예시 이미지 30개
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-01-nAWF4nwLwy7mtDDuAgtMwS.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-02-JWYbphVDNoy3v3vcZpgPY8.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-03-2xePnVUvxM9M5NSdYWHLij.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-04-6eA3LmDHbGk65LKcvDoufZ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-05-WvbuEHxepPfpGAVqxkE2Vu.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-06-LZ46BLBi7a4pJZ9wtGsNui.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-07-NnGbbio4wYN2mwjwsfP9nd.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-08-nKKxTbpP5c6VA2e4haRqsV.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-09-A6oweMLFjvJRuvcqy3gzcy.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-10-SeWckAoA8UXF9GZu2kaJYG.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-11-QoSTTamD7nSWvQ8VPgf3du.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-12-AmZHqSo4YHoyWhqSLL6bxt.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-13-aNwVPEyrCRVvkWF8mkRTPb.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-14-22SovgdQjaxEcJZmrsYcqt.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-15-Mpx5EhbGydsxVhRbGZ4LLu.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-16-FFg7gWz5WXrtibiZ8QsSQQ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-17-94iAv2AQQdvJWit4naW8tb.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-18-CW64mti7TZhpYmh6Bc4TFS.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-19-g7etczKZrvZd2xAEduYmKg.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-20-52Erh57PFDFkeoDCNk72k4.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-21-26tn3HizvJWsAH2ntJxjuk.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-22-dHgTUjGMF7qmZoLXLUgkRN.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-23-EHdpC9Q3dNqS6YztCuX6m4.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-24-PAQj7arhDFnLaxr2qVjZq9.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-25-DZBDZEEVeA9y23HmSGwXhx.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-26-MH9oTc8DDRYsLRkZR9c4oh.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-27-KxqnuK4v5RK6iQVRT9Cg54.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-28-ED8DsLXa5mSGRnKCoC5FSo.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-29-3nJMc2g4T8PRekVSpwW8TQ.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/sticker-masonry-30-Ha9L4j45vZ9rR8uL2VK2H8.png",
  ],
  "form": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/NuxSflzJ1Et1_a2d6fcf9.jpg",
  ],
  "promo": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/category-business-card-Vp6QmGVxNzNo4FirbbW9oT.webp",
  ],
  "calendar": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/캘린더_488afa48.png",
  ],
  "signage": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연표지판001-320_05f07d54.png",
  ],
  "largeformat": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/category-digital-KuQAG9p2Muw5sABAm9GmNn.webp",
  ],
  "digital": [
    // Dashboard 대표 이미지
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/SLIV2sS1E5to_55c9fd1f.jpg",
  ],
  "largeformat-banner": [
    // 0: 현수막 유치원어린이집
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/3.현수막(유치원어린이집)-복사본_ac072625.webp",
    // 1: 현수막 유치원어린이집 지자체로고용
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/3.현수막(유치원어린이집)_지자체로고용-복사본_866ff023.webp",
    // 2: 현수막 초중고교
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/3.현수막(초중고교)-복사본_26ec9ade.webp",
    // 3: 현수막 초중고교 지자체로고용
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/3.현수막(초중고교)_지자체로고용-복사본_6e8881d6.webp",
  ],
  "largeformat-xbanner": [
    // 0: X배너/포스터 세로형
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/4.포스터(X배너)-복사본_4dcbf327.webp",
  ],
  "20": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/smoking-success-badge-low-res_612cf64e.jpg",
    "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/DGDUUs8OrKeTayfKDeBIz9-img-2_1771726490000_na1fn_c3RpY2tlci1zcXVhcmU.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0RHRFVVczhPcktlVGF5ZktEZUJJejktaW1nLTJfMTc3MTcyNjQ5MDAwMF9uYTFmbl9jM1JwWTJ0bGNpMXpjWFZoY21VLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AQ~f-hFYpfX~bSJ0gQcXhdY7xdrV6H4SbYoxikgqICx~NcLPqvnvZnaKo8L8-SYsmpRNaOHOkZWox5Mr-qUr1F5WbgkshpXDSPDTrLOpMX73~ul1EvVEL-DPvkYCVn6WxgzlVQQJuaX2oZN97XQ7vklf11xE2MOFZFrxA4XX9nwsIslx1~BBw-ybzfzC1EzvN1uGRWU~T6uavXArVgZXu7RXtOmdwV4NgXyacEXaEJFdjaUBtYhmRBq0SIpcn-YN~V6c31XtTwgSZvQE~4czhfq6dfMOiL1Z4ztcvfpiY2YP7BNbATHk0FHjHwUA-HrM-VJF-dhyRf-axfNzCkVJBQ__",
    "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/DGDUUs8OrKeTayfKDeBIz9-img-3_1771726481000_na1fn_c3RpY2tlci10cmFuc3BhcmVudA.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0RHRFVVczhPcktlVGF5ZktEZUJJejktaW1nLTNfMTc3MTcyNjQ4MTAwMF9uYTFmbl9jM1JwWTJ0bGNpMTBjbUZ1YzNCaGNtVnVkQS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=GGvSQJeR~l9u4ubi-VAeDr7ur74xa1XNUu0QyOiCuQ4kCfQ-SeCNKaMS~9153qNDEz0X17PvMr72ooyi3LKbXIQvXgB3-Z0OSkl6iXL9d4t8JIuqSzQV8~2GDfW-YT3o47e~VU2VMgNHQg5Hs5n8ZjHZsga5KXg0YbfK~35K7hYkTLVHoq8a-QmRT98icAaP8iH6xVccV1WGnm8K8~KzBAxmBYCWRLboaHRQ31NGhBmDzwllbNgAzd0i6a~Ugbc7KbG4W4KroXEpTliQGySpSvaTcCYw5f1AwZbJv-yCNiE5zhMGNnk9YvH1DQPXTVEokV5T9mwEV7Sz2B6y7mEiTg__",
    "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/DGDUUs8OrKeTayfKDeBIz9-img-4_1771726499000_na1fn_c3RpY2tlci1zaWx2ZXI.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0RHRFVVczhPcktlVGF5ZktEZUJJejktaW1nLTRfMTc3MTcyNjQ5OTAwMF9uYTFmbl9jM1JwWTJ0bGNpMXphV3gyWlhJLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KAV3WS3cFdyWfX6KuQzeOCL9w2e02jfe0l7Ar25fhmSME~Gqbk2hpDaNUPAl3hatTzVOwI5~E5tO2vjfBErAJp0s~ZZhytRcI266LeFoDRpGsGkJdOwh3idusH34oOlszfrdJcXS-ctTJE2KnJGfGLOE6M8CKjn0ib~aqgGFMV~nCsyLDfksU-6TlTUCX8AaARNcvXQxOYWoqgin7NRnY9CRPSZYvNKvt3sd~S4geNjWhU77uKyGjweMr1pcNJPvVPZJ4YT9Sd~IC7HBACwfn2vtOECPdfkdSsoIHicZCFJ1MSIll5D1xxKlIIwvefaC3kiXIfkzcj9Jqb6aV93Pmg__",
  ],
};

// Category banner images for intro sections
const subCategoryBanners: Record<string, { image: string; title: string; subtitle: string; gradient: string }> = {
  "8010": {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=500&fit=crop",
    title: "금연 사업",
    subtitle: "금연 예방부터 성공까지, 보건소 금연 사업을 지원하는 다양한 캠페인 부착물을 제작합니다.",
    gradient: "from-slate-900/70 via-slate-800/40 to-transparent",
  },
  "8020": {
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1400&h=500&fit=crop",
    title: "암 예방",
    subtitle: "조기 발견과 예방의 중요성을 알리는 암 예방 캠페인 부착물을 제작합니다.",
    gradient: "from-rose-900/70 via-rose-800/40 to-transparent",
  },
  "8030": {
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1400&h=500&fit=crop",
    title: "예방접종",
    subtitle: "예방접종의 안전성과 필요성을 알리는 안내 부착물을 제작합니다.",
    gradient: "from-blue-900/70 via-blue-800/40 to-transparent",
  },
  "8040": {
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&h=500&fit=crop",
    title: "치매·정신건강",
    subtitle: "치매 조기 발견과 정신건강 인식 개선을 위한 캠페인 부착물을 제작합니다.",
    gradient: "from-purple-900/70 via-purple-800/40 to-transparent",
  },
  "8050": {
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&h=500&fit=crop",
    title: "노인 건강",
    subtitle: "노인 건강 증진과 생활 질 향상을 위한 다양한 안내 부착물을 제작합니다.",
    gradient: "from-amber-900/70 via-amber-800/40 to-transparent",
  },
  "8060": {
    image: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1400&h=500&fit=crop",
    title: "모자 보건",
    subtitle: "엄마와 아이의 건강한 시작을 지원하는 모자 보건 캠페인 부착물을 제작합니다.",
    gradient: "from-pink-900/70 via-pink-800/40 to-transparent",
  },
  "8070": {
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1400&h=500&fit=crop",
    title: "신체활동",
    subtitle: "규칙적인 신체활동을 장려하는 건강 캠페인 부착물을 제작합니다.",
    gradient: "from-green-900/70 via-green-800/40 to-transparent",
  },
  "8080": {
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1400&h=500&fit=crop",
    title: "심뇌혁관",
    subtitle: "심장질환과 뇌혁관질환 예방을 위한 만성질환 관리 부착물을 제작합니다.",
    gradient: "from-red-900/70 via-red-800/40 to-transparent",
  },
  "8090": {
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&h=500&fit=crop",
    title: "영양 관리",
    subtitle: "올바른 식습관과 영양 관리를 안내하는 영양 캠페인 부착물을 제작합니다.",
    gradient: "from-lime-900/70 via-lime-800/40 to-transparent",
  },
  "8100": {
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&h=500&fit=crop",
    title: "정신건강",
    subtitle: "정신건강 인식 개선과 우울증 예방을 위한 캠페인 부착물을 제작합니다.",
    gradient: "from-indigo-900/70 via-indigo-800/40 to-transparent",
  },
  "8110": {
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1400&h=500&fit=crop",
    title: "구강 보건",
    subtitle: "올바른 친슬 습관과 구강 건강의 중요성을 알리는 캠페인 부착물을 제작합니다.",
    gradient: "from-teal-900/70 via-teal-800/40 to-transparent",
  },
  "8120": {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=500&fit=crop",
    title: "절주 사업",
    subtitle: "과도한 음주의 해로움과 절주의 필요성을 알리는 캠페인 부착물을 제작합니다.",
    gradient: "from-orange-900/70 via-orange-800/40 to-transparent",
  },
};

const categoryBanners: Record<string, { image: string; title: string; subtitle: string; gradient: string }> = {
  "80": {
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=500&fit=crop",
    title: "캠페인 부착물",
    subtitle: "금연사업부터 정신건강까지, 보건소 각 사업에 맞는 캠페인 부착물을 전문적으로 제작합니다.",
    gradient: "from-emerald-900/70 via-emerald-800/40 to-transparent",
  },
  "30": {
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=500&fit=crop",
    title: "봉투",
    subtitle: "대봉투부터 소봉투까지, 보건소 공문서 발송에 적합한 고품질 봉투를 제작합니다.",
    gradient: "from-stone-900/70 via-stone-800/40 to-transparent",
  },
  "40": {
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1400&h=500&fit=crop",
    title: "홍보물",
    subtitle: "전단지, 포스터, 리플렛, 카다로그까지 보건소 홍보에 필요한 인쇄물을 제작합니다.",
    gradient: "from-cyan-900/70 via-cyan-800/40 to-transparent",
  },
  "50": {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=500&fit=crop",
    title: "쇼핑백",
    subtitle: "규격형부터 맞춤 디자인까지, 보건소 브랜드를 담은 품격 쇼핑백을 제작합니다.",
    gradient: "from-violet-900/70 via-violet-800/40 to-transparent",
  },
  "60": {
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1400&h=500&fit=crop",
    title: "캘린더",
    subtitle: "탁상용부터 벽걸이용까지, 보건소 연간 업무를 담는 고품질 캘린더를 제작합니다.",
    gradient: "from-sky-900/70 via-sky-800/40 to-transparent",
  },
  "70": {
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=500&fit=crop",
    title: "디지털소량인쇄",
    subtitle: "소량으로도 신속하게, 1부부터 가능한 디지털 소량 인쇄로 업무 효율을 높입니다.",
    gradient: "from-zinc-900/70 via-zinc-800/40 to-transparent",
  },
  "10": {
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/명함베너_c3b8a1d4.webp",
    title: "명함",
    subtitle: "보건소 담당자를 위한 표준명함. 기관 내 명함 규격을 통일하여 신뢰있는 첫인상을 만듭니다.",
    gradient: "from-black/60 via-black/30 to-transparent",
  },
  "namecard": {
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/명함베너_c3b8a1d4.webp",
    title: "명함",
    subtitle: "보건소 담당자를 위한 표준명함. 기관 내 명함 규격을 통일하여 신뢰있는 첫인상을 만듭니다.",
    gradient: "from-[#00A39B]/60 via-[#00A39B]/30 to-transparent",
  },
  "namecard-standard": {
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/명함베너_c3b8a1d4.webp",
    title: "표준명함 (90×50mm)",
    subtitle: "보건소 담당자를 위한 표준명함. 기관 내 명함 규격을 통일하여 신뢰있는 첫인상을 만듭니다.",
    gradient: "from-[#00A39B]/60 via-[#00A39B]/30 to-transparent",
  },
  "namecard-regional": {
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/명함베너_c3b8a1d4.webp",
    title: "우리 보건소 명함",
    subtitle: "각 보건소의 특성을 반영한 맞춤형 명함. 기관의 정체성을 담아 신뢰있는 첫인상을 만듭니다.",
    gradient: "from-[#00A39B]/60 via-[#00A39B]/30 to-transparent",
  },
  "4050": {
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1400&h=500&fit=crop",
    title: "금연성공 기념품",
    subtitle: "금연성공을 축하하는 의미 있는 기념품. 머그컵, 수첩, 에코백 등 다양한 실용품에 보건소 로고를 인쇄하여 제작합니다.",
    gradient: "from-emerald-900/70 via-emerald-800/40 to-transparent",
  },
  "20": {
    image: "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/gXMKPzSDUNxO1VAC0EtHWV-img-1_1771724218000_na1fn_c3RpY2tlci1iYW5uZXI.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L2dYTUtQelNEVU54TzFWQUMwRXRIV1YtaW1nLTFfMTc3MTcyNDIxODAwMF9uYTFmbl9jM1JwWTJ0bGNpMWlZVzV1WlhJLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ldfef5sW5ftyo~guB~dW3joY-L~G0Hqc8K0CB9IF3dtTBycr5WJYn-JRw6XcJRcdFd86Hhso-OBZgyo5SriJpcO5KikZVuX8NZuU8sdBGsJ9l5KVFisvotWbpw9ZEHDE-sVQHN3kHNOEX-X~PhVDVCe3mHdw5aPGg0G4bTvM9ATbTSevu4BIaXIixlATELSr2W-GciHEZVv0Vux3C6BLz~z31wFcvrCd2CfU9BpZe1twyQZ4y8jtwu7KvCjHqukQILOkuAxJnvo3loJMgE5vZvArWpg6oyODUgA8cB0MLGWmdQk4nIkvvXjXkt64PGWcJCEMGZAKtlBbNjVGIVcPyw__",
    title: "스티커",
    subtitle: "보건소에 필요한 다양한 스티커를 만나보세요. 일반지부터 특수지까지, 용도에 맞는 최적의 스티커를 제작합니다.",
    gradient: "from-black/60 via-black/30 to-transparent",
  },
  "sticker": {
    image: "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/gXMKPzSDUNxO1VAC0EtHWV-img-1_1771724218000_na1fn_c3RpY2tlci1iYW5uZXI.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L2dYTUtQelNEVU54TzFWQUMwRXRIV1YtaW1nLTFfMTc3MTcyNDIxODAwMF9uYTFmbl9jM1JwWTJ0bGNpMWlZVzV1WlhJLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ldfef5sW5ftyo~guB~dW3joY-L~G0Hqc8K0CB9IF3dtTBycr5WJYn-JRw6XcJRcdFd86Hhso-OBZgyo5SriJpcO5KikZVuX8NZuU8sdBGsJ9l5KVFisvotWbpw9ZEHDE-sVQHN3kHNOEX-X~PhVDVCe3mHdw5aPGg0G4bTvM9ATbTSevu4BIaXIixlATELSr2W-GciHEZVv0Vux3C6BLz~z31wFcvrCd2CfU9BpZe1twyQZ4y8jtwu7KvCjHqukQILOkuAxJnvo3loJMgE5vZvArWpg6oyODUgA8cB0MLGWmdQk4nIkvvXjXkt64PGWcJCEMGZAKtlBbNjVGIVcPyw__",
    title: "스티커",
    subtitle: "보건소에 필요한 다양한 스티커를 만나보세요. 일반지부터 특수지까지, 용도에 맞는 최적의 스티커를 제작합니다.",
    gradient: "from-black/60 via-black/30 to-transparent",
  },
  "form": {
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=500&fit=crop",
    title: "일반서식",
    subtitle: "봉투, 메모지, 영수증 등 보건소 업무에 필요한 각종 서식류를 제작합니다.",
    gradient: "from-stone-900/70 via-stone-800/40 to-transparent",
  },
  "promo": {
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1400&h=500&fit=crop",
    title: "홍보물",
    subtitle: "포스터, 전단지, 브로슈어, 현수막까지 보건소 홍보에 필요한 인쇄물을 제작합니다.",
    gradient: "from-cyan-900/70 via-cyan-800/40 to-transparent",
  },
  "calendar": {
    image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=1400&h=500&fit=crop",
    title: "캘린더",
    subtitle: "탁상용부터 벽걸이용까지, 보건소 연간 업무를 담는 고품질 캘린더를 제작합니다.",
    gradient: "from-sky-900/70 via-sky-800/40 to-transparent",
  },
  "signage": {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=500&fit=crop",
    title: "표지판",
    subtitle: "문패, 안내판, 아크릴 표지판 등 보건소 내외부 안내에 필요한 표지판을 제작합니다.",
    gradient: "from-slate-900/70 via-slate-800/40 to-transparent",
  },
  "largeformat": {
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=500&fit=crop",
    title: "실사출력",
    subtitle: "현수막, X배너, 폼보드 등 대형 실사출력 인쇄물을 신속하게 제작합니다.",
    gradient: "from-zinc-900/70 via-zinc-800/40 to-transparent",
  },
  "digital": {
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&h=500&fit=crop",
    title: "소량인쇄",
    subtitle: "소량으로도 신속하게, 1부부터 가능한 디지털 소량 인쇄로 업무 효율을 높입니다.",
    gradient: "from-zinc-900/70 via-zinc-800/40 to-transparent",
  },
  "biz": {
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=500&fit=crop",
    title: "사업별",
    subtitle: "금연, 암 예방, 예방접종 등 보건소 각 사업에 맞는 인쇄물을 전문적으로 제작합니다.",
    gradient: "from-emerald-900/70 via-emerald-800/40 to-transparent",
  },
};

// Default placeholder image for categories without specific images
const defaultProductImage = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=400&fit=crop";

// Sample products for each category with image index, tags
interface Product {
  name: string;
  price: string;
  desc: string;
  tags?: string[];
  imageIdx?: number;
}

const sampleProducts: Record<string, Product[]> = {
  "1010": [
    { name: "소프트 명함 350g", price: "25,000원~", desc: "부드러운 촉감의 인기 명함", tags: ["#소프트촉감", "#350g", "#인기상품"], imageIdx: 0 },
    { name: "프리미엄 두꺼운 명함 400g", price: "35,000원~", desc: "두꺼운 용지의 고급 명함", tags: ["#400g", "#두꺼운용지", "#프리미엄"], imageIdx: 1 },
    { name: "크림 매트 명함 300g", price: "28,000원~", desc: "크림색 매트 질감의 명함", tags: ["#크림색", "#매트질감", "#고급스러운"], imageIdx: 2 },
  ],
  "1020": [
    { name: "리넨지 명함", price: "35,000원~", desc: "리넨 질감의 고급 특수지 명함", tags: ["#리넨질감", "#특수지", "#텍스처명함"], imageIdx: 0 },
    { name: "펠트지 명함", price: "38,000원~", desc: "부드러운 펠트 질감의 명함", tags: ["#펠트질감", "#부드러운", "#고급감성"], imageIdx: 1 },
    { name: "펄지 명함", price: "36,000원~", desc: "은은한 펄 광택의 명함", tags: ["#은은한펄", "#광택", "#고급스러운"], imageIdx: 2 },
    { name: "매트블랙 명함", price: "42,000원~", desc: "세련된 매트 블랙 명함", tags: ["#매트블랙", "#세련된", "#모던"], imageIdx: 3 },
    { name: "투명 PET 명함", price: "55,000원~", desc: "투명 PET 소재의 유니크한 명함", tags: ["#투명PET", "#유니크", "#특별한"], imageIdx: 4 },
    { name: "스팟글로스 명함", price: "45,000원~", desc: "부분 UV 코팅의 고급 명함", tags: ["#스팟UV", "#부분코팅", "#프리미엄"], imageIdx: 5 },
    { name: "럭스 두꺼운 명함", price: "48,000원~", desc: "초두꺼운 럭스 용지 명함", tags: ["#초두꺼운", "#럭스용지", "#프리미엄"], imageIdx: 6 },
    { name: "박 명함 (금박/은박)", price: "50,000원~", desc: "금박/은박 포인트의 명함", tags: ["#금박", "#은박", "#포인트가공"], imageIdx: 7 },
  ],
  "1030": [
    { name: "일반지 명함 (단면)", price: "15,000원~", desc: "깔끔한 단면 일반지 명함", tags: ["#단면인쇄", "#일반지", "#경제적"], imageIdx: 0 },
    { name: "일반지 명함 (양면)", price: "20,000원~", desc: "양면 풀컬러 일반지 명함", tags: ["#양면풀컬러", "#일반지", "#합리적"], imageIdx: 1 },
    { name: "코팅 명함 (무광)", price: "25,000원~", desc: "무광 코팅 처리된 명함", tags: ["#무광코팅", "#깔끔한", "#실용적"], imageIdx: 2 },
    { name: "코팅 명함 (유광)", price: "25,000원~", desc: "유광 코팅 처리된 명함", tags: ["#유광코팅", "#반짝이는", "#선명한"], imageIdx: 3 },
  ],
  "1040": [
    { name: "에코 명함", price: "30,000원~", desc: "재생 용지로 만든 친환경 명함", tags: ["#재생용지", "#친환경", "#에코"], imageIdx: 0 },
    { name: "크라프트 명함", price: "32,000원~", desc: "크라프트지의 자연스러운 명함", tags: ["#크라프트지", "#자연스러운", "#빈티지"], imageIdx: 1 },
  ],
  "10": [
    { name: "소프트 명함 350g", price: "25,000원~", desc: "부드러운 촉감의 인기 명함", tags: ["#소프트촉감", "#350g", "#인기상품"], imageIdx: 0 },
    { name: "프리미엄 두꺼운 명함 400g", price: "35,000원~", desc: "두꺼운 용지의 고급 명함", tags: ["#400g", "#두꺼운용지", "#프리미엄"], imageIdx: 1 },
    { name: "리넨지 명함", price: "35,000원~", desc: "리넨 질감의 고급 특수지 명함", tags: ["#리넨질감", "#특수지", "#텍스처명함"], imageIdx: 2 },
    { name: "펄지 명함", price: "36,000원~", desc: "은은한 펄 광택의 명함", tags: ["#은은한펄", "#광택", "#고급스러운"], imageIdx: 3 },
    { name: "에코 명함", price: "30,000원~", desc: "재생 용지로 만든 친환경 명함", tags: ["#재생용지", "#친환경", "#에코"], imageIdx: 4 },
    { name: "박 명함 (금박/은박)", price: "50,000원~", desc: "금박/은박 포인트의 명함", tags: ["#금박", "#은박", "#포인트가공"], imageIdx: 5 },
  ],
  "namecard": [
    { name: "표준명함 (90×50mm) A Type", price: "25,000원~", desc: "고민없이 선택하는 기본 중의 기본! 보건소 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#인기상품"], imageIdx: 0 },
    { name: "표준명함 (90×50mm) B Type", price: "28,000원~", desc: "세련된 디자인의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#세련된"], imageIdx: 1 },
    { name: "표준명함 (90×50mm) C Type", price: "30,000원~", desc: "고급스러운 느낌의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#고급스러운"], imageIdx: 2 },
    { name: "표준명함 (90×50mm) D Type", price: "32,000원~", desc: "모던한 스타일의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#모던"], imageIdx: 3 },
    { name: "표준명함 (90×50mm) E Type", price: "35,000원~", desc: "심플하고 깔끔한 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#심플"], imageIdx: 4 },
    { name: "표준명함 (90×50mm) F Type", price: "38,000원~", desc: "전문적인 이미지의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#전문적"], imageIdx: 5 },
    { name: "표준명함 (90×50mm) G Type", price: "40,000원~", desc: "차별화된 디자인의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#차별화"], imageIdx: 6 },
    { name: "표준명함 (90×50mm) H Type", price: "45,000원~", desc: "프리미엄 품질의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#프리미엄"], imageIdx: 7 },
  ],
  "namecard-standard": [
    { name: "표준명함 (90×50mm) A Type", price: "25,000원~", desc: "고민없이 선택하는 기본 중의 기본! 보건소 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#인기상품"], imageIdx: 0 },
    { name: "표준명함 (90×50mm) B Type", price: "28,000원~", desc: "세련된 디자인의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#세련된"], imageIdx: 1 },
    { name: "표준명함 (90×50mm) C Type", price: "30,000원~", desc: "고급스러운 느낌의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#고급스러운"], imageIdx: 2 },
    { name: "표준명함 (90×50mm) D Type", price: "32,000원~", desc: "모던한 스타일의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#모던"], imageIdx: 3 },
    { name: "표준명함 (90×50mm) E Type", price: "35,000원~", desc: "심플하고 깔끔한 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#심플"], imageIdx: 4 },
    { name: "표준명함 (90×50mm) F Type", price: "38,000원~", desc: "전문적인 이미지의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#전문적"], imageIdx: 5 },
    { name: "표준명함 (90×50mm) G Type", price: "40,000원~", desc: "차별화된 디자인의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#차별화"], imageIdx: 6 },
    { name: "표준명함 (90×50mm) H Type", price: "45,000원~", desc: "프리미엄 품질의 표준 규격 명함", tags: ["#표준규격", "#90x50mm", "#프리미엄"], imageIdx: 7 },
  ],
  "namecard-premium": [
    { name: "고급명함 (90×50mm)", price: "35,000원~", desc: "와이드한 명함을 원한다면? 90×50mm 황금비율 명함", tags: ["#고급형", "#90x50mm", "#황금비율"], imageIdx: 1 },
  ],
  "namecard-doublesided": [
    { name: "양면명함", price: "28,000원~", desc: "앞뒤 모두 활용하는 정보력 있는 양면 인쇄 명함", tags: ["#양면인쇄", "#정보력", "#실용적"], imageIdx: 2 },
  ],
  "namecard-coating": [
    { name: "코팅명함 (무광)", price: "30,000원~", desc: "무광 코팅으로 고급스러운 느낌의 명함", tags: ["#무광코팅", "#고급스러운", "#매트"], imageIdx: 3 },
    { name: "코팅명함 (유광)", price: "30,000원~", desc: "유광 코팅으로 선명하고 반짝이는 명함", tags: ["#유광코팅", "#선명한", "#반짝이는"], imageIdx: 4 },
  ],
  "namecard-special": [
    { name: "특수지명함", price: "45,000원~", desc: "리넨·펄·매트블랙 등 다양한 특수지 명함", tags: ["#특수지", "#리넨", "#펄"], imageIdx: 5 },
  ],
  "namecard-card": [
    { name: "카드명함 (PET)", price: "55,000원~", desc: "물에 젖지 않고 쉽게 찢어지지 않는 플라스틱 재질 명함", tags: ["#PET", "#방수", "#내구성"], imageIdx: 0 },
  ],
  "sticker": [
    { name: "스티커 (사각)", price: "25,000원~", desc: "다양한 규격으로 주문 가능 합니다.", tags: ["#사각커팅", "#일반지", "#경제적"], imageIdx: 1 },
    { name: "일반지 스티커 (원형)", price: "30,000원~", desc: "원형 커팅 일반지 스티커", tags: ["#원형커팅", "#일반지", "#다용도"], imageIdx: 0 },
    { name: "특수지 스티커 (투명)", price: "45,000원~", desc: "투명 PET 소재 스티커", tags: ["#투명PET", "#특수지", "#고급스티커"], imageIdx: 2 },
    { name: "특수지 스티커 (은박)", price: "55,000원~", desc: "은박 소재 고급 스티커", tags: ["#은박소재", "#특수지", "#프리미엄"], imageIdx: 3 },
  ],
  "sticker-general": [
    { name: "건강한 미래 스티커 01", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 0 },
    { name: "건강한 미래 스티커 02", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 1 },
    { name: "건강한 미래 스티커 03", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 2 },
    { name: "건강한 미래 스티커 04", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 3 },
    { name: "건강한 미래 스티커 05", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 4 },
    { name: "건강한 미래 스티커 06", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 5 },
    { name: "건강한 미래 스티커 07", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 6 },
    { name: "건강한 미래 스티커 08", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 7 },
    { name: "건강한 미래 스티커 09", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 8 },
    { name: "건강한 미래 스티커 10", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 9 },
    { name: "건강한 미래 스티커 11", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 10 },
    { name: "건강한 미래 스티커 12", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 11 },
    { name: "건강한 미래 스티커 13", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 12 },
    { name: "건강한 미래 스티커 14", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 13 },
    { name: "건강한 미래 스티커 15", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 14 },
    { name: "건강한 미래 스티커 16", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 15 },
    { name: "건강한 미래 스티커 17", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 16 },
    { name: "건강한 미래 스티커 18", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 17 },
    { name: "건강한 미래 스티커 19", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 18 },
    { name: "건강한 미래 스티커 20", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 19 },
    { name: "건강한 미래 스티커 21", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 20 },
    { name: "건강한 미래 스티커 22", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 21 },
    { name: "건강한 미래 스티커 23", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 22 },
    { name: "건강한 미래 스티커 24", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 23 },
    { name: "건강한 미래 스티커 25", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 24 },
    { name: "건강한 미래 스티커 26", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 25 },
    { name: "건강한 미래 스티커 27", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 26 },
    { name: "건강한 미래 스티커 28", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 27 },
    { name: "건강한 미래 스티커 29", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 28 },
    { name: "건강한 미래 스티커 30", price: "15,000원~", desc: "건강 캠페인용 스티커", tags: ["#건강", "#캠페인", "#스티커"], imageIdx: 29 },
  ],
  "sticker-special": [
    { name: "금연 스티커 (유치원·어린이집)", price: "100,000원~", desc: "30m 내 담배금지 유치원·어린이집 시설 부착용 스티커 (2024년 보건복지부 공식)", tags: ["#스티커", "#유아시설", "#금연구역", "#2024"], imageIdx: 0 },
    { name: "금연 스티커 (유치원·어린이집) 지자체로고용", price: "100,000원~", desc: "30m 내 담배금지 유치원·어린이집 시설 부착용 스티커 지자체로고 인쇄 버전 (2024년 보건복지부 공식)", tags: ["#스티커", "#유아시설", "#지자체로고", "#2024"], imageIdx: 1 },
    { name: "금연 스티커 (초·중·고등학교)", price: "100,000원~", desc: "30m 내 담배금지 초·중·고등학교 시설 부착용 스티커 (2024년 보건복지부 공식)", tags: ["#스티커", "#학교", "#금연구역", "#2024"], imageIdx: 2 },
    { name: "금연 스티커 (초·중·고등학교) 지자체로고용", price: "100,000원~", desc: "30m 내 담배금지 초·중·고등학교 시설 부착용 스티커 지자체로고 인쇄 버전 (2024년 보건복지부 공식)", tags: ["#스티커", "#학교", "#지자체로고", "#2024"], imageIdx: 3 },
  ],
  "form": [
    { name: "대봉투 (A4)", price: "120,000원~", desc: "A4 서류용 대봉투", tags: ["#A4사이즈", "#서류용", "#대봉투"] },
    { name: "소봉투 (일반)", price: "80,000원~", desc: "일반 소봉투", tags: ["#일반형", "#소봉투", "#경제적"] },
    { name: "메모지·노트", price: "50,000원~", desc: "보건소 로고 인쇄 메모지 및 노트", tags: ["#메모지", "#노트", "#로고인쇄"] },
    { name: "영수증·전표", price: "80,000원~", desc: "보건소 업무용 영수증 및 전표", tags: ["#영수증", "#전표", "#업무용"] },
  ],
  "promo": [
    { name: "포스터 (A2)", price: "120,000원~", desc: "A2 대형 포스터", tags: ["#A2포스터", "#대형인쇄", "#게시용"] },
    { name: "전단지 (A4)", price: "89,000원~", desc: "A4 사이즈 전단지", tags: ["#A4전단지", "#홍보용", "#대량인쇄"] },
    { name: "3단 리플렛", price: "249,000원~", desc: "3단 접지 리플렛", tags: ["#3단접지", "#리플렛", "#프로그램안내"] },
    { name: "브로슈어 (8p)", price: "450,000원~", desc: "8페이지 브로슈어", tags: ["#8페이지", "#브로슈어", "#사업안내"] },
    { name: "현수막·배너", price: "150,000원~", desc: "보건소 행사용 현수막 및 배너", tags: ["#현수막", "#배너", "#행사용"] },
    { name: "쇼핑백", price: "180,000원~", desc: "보건소 브랜드 쇼핑백", tags: ["#쇼핑백", "#브랜딩", "#기념품"] },
  ],
  "promo-poster": [
    { name: "금연지원서비스 포스터", price: "100,000원~", desc: "끊겠다는 다짐, 금연지원서비스와 함께 지켜요 — 건강한 삶을 위해 담배 접근 금지! (2022년 보건복지부 공식)", tags: ["#포스터", "#금연지원서비스", "#2022"], imageIdx: 0 },
    { name: "아파트 금연구역 포스터", price: "100,000원~", desc: "더불어 살아가는 공간, 금연으로 지켜요 — 건강한 아파트를 위해 담배 접근 금지! (2022년 보건복지부 공식)", tags: ["#포스터", "#아파트", "#금연구역", "#2022"], imageIdx: 1 },
    { name: "유아시설 금연구역 포스터", price: "100,000원~", desc: "아이들의 건강한 공간, 금연으로 지켜요 — 건강한 유아시설을 위해 10m 내 담배 접근 금지! (2022년 보건복지부 공식)", tags: ["#포스터", "#유아시설", "#금연구역", "#2022"], imageIdx: 2 },
    { name: "학교 금연구역 포스터", price: "100,000원~", desc: "학생들의 꿈 꾸는 공간, 금연으로 지켜요 — 건강한 학교를 위해 00m 내 담배 접근 금지! (2022년 보건복지부 공식)", tags: ["#포스터", "#학교", "#금연구역", "#2022"], imageIdx: 3 },
    { name: "30m 내 담배금지 포스터 (세로형)", price: "100,000원~", desc: "건강한 교육환경을 위해 30m 내 담배금지 — 유치원·어린이집·초중고교 경계 30m까지 금연구역으로 지정 (2024년 보건복지부 공식)", tags: ["#포스터", "#세로형", "#유아시설", "#학교", "#금연구역", "#2024"], imageIdx: 4 },
    { name: "30m 내 담배금지 포스터 (가로형)", price: "100,000원~", desc: "건강한 교육환경을 위해 30m 내 담배금지 — 유치원·어린이집·초중고교 경계 30m까지 금연구역으로 지정 (2024년 보건복지부 공식)", tags: ["#포스터", "#가로형", "#유아시설", "#학교", "#금연구역", "#2024"], imageIdx: 5 },
    { name: "제35회 세계 금연의날 기념식 포스터", price: "100,000원~", desc: "제35회 세계 금연의날 기념식 및 학술포럼 공식 포스터 (2022년 보건복지부·한국건강증진개발원 공식)", tags: ["#포스터", "#세계금연의날", "#35회", "#2022"], imageIdx: 6 },
  ],
  "promo-leaflet": [
    { name: "3단 리플렛 — 궐련형 전자담배", price: "249,000원~", desc: "가열담배(궐련형 전자담배) 위해성 안내 3단 리플렛 (2018년 보건복지부 공식)", tags: ["#3단리플렛", "#가열담배", "#금연홍보", "#2018"], imageIdx: 0 },
  ],
  "calendar": [
    { name: "탁상용 캘린더 (기본)", price: "150,000원~", desc: "기본형 탁상 캘린더", tags: ["#탁상용", "#기본형", "#실용적"] },
    { name: "탁상용 캘린더 (고급)", price: "220,000원~", desc: "고급형 탁상 캘린더", tags: ["#탁상용", "#고급형", "#프리미엄"] },
    { name: "벽걸이 캘린더 (A3)", price: "280,000원~", desc: "A3 벽걸이 캘린더", tags: ["#벽걸이", "#A3", "#사무실용"] },
    { name: "포켓 다이어리", price: "180,000원~", desc: "휴대용 포켓 다이어리", tags: ["#포켓", "#다이어리", "#휴대용"] },
  ],
  "signage": [
    { name: "공원용 금연표지판", price: "문의", desc: "전국 공원 어디든 설치 가능한 목재 금연공원 표지판", tags: ["#금연표지판", "#공원", "#목재", "#야외용"], imageIdx: 0 },
    { name: "안내판", price: "80,000원~", desc: "보건소 부서 안내판", tags: ["#안내판", "#부서표시"] },
    { name: "아크릴 표지판", price: "120,000원~", desc: "고급 아크릴 소재 표지판", tags: ["#아크릴", "#고급", "#실내용"] },
    { name: "야외용 표지판", price: "200,000원~", desc: "내구성 강한 야외용 표지판", tags: ["#야외용", "#내구성", "#방수"] },
    { name: "바닥 표지", price: "90,000원~", desc: "보건소 내부 바닥 안내 표지", tags: ["#바닥표지", "#안내", "#실내용"] },
  ],
  "largeformat": [
    { name: "현수막", price: "50,000원~", desc: "보건소 행사용 현수막", tags: ["#현수막", "#행사용", "#대형"] },
    { name: "X배너·롤업", price: "80,000원~", desc: "이동식 X배너 및 롤업 배너", tags: ["#X배너", "#롤업", "#이동식"] },
    { name: "금연구역 현수막 (유치원·어린이집)", price: "150,000원~", desc: "30m 내 담배금지 유치원·어린이집 시설 현수막 (2024년 보건복지부 공식)", tags: ["#현수막", "#유아시설", "#금연구역", "#2024"], imageIdx: 0 },
    { name: "금연구역 현수막 (유치원·어린이집) 지자체로고용", price: "150,000원~", desc: "30m 내 담배금지 유치원·어린이집 시설 현수막 지자체로고 인쇄 버전 (2024년 보건복지부 공식)", tags: ["#현수막", "#유아시설", "#지자체로고", "#2024"], imageIdx: 1 },
    { name: "금연구역 현수막 (초·중·고등학교)", price: "150,000원~", desc: "30m 내 담배금지 초·중·고등학교 시설 현수막 (2024년 보건복지부 공식)", tags: ["#현수막", "#학교", "#금연구역", "#2024"], imageIdx: 2 },
    { name: "금연구역 현수막 (초·중·고등학교) 지자체로고용", price: "150,000원~", desc: "30m 내 담배금지 초·중·고등학교 시설 현수막 지자체로고 인쇄 버전 (2024년 보건복지부 공식)", tags: ["#현수막", "#학교", "#지자체로고", "#2024"], imageIdx: 3 },
    { name: "폼보드", price: "60,000원~", desc: "가벼운 폼보드 대형 인쇄", tags: ["#폼보드", "#가벼운", "#실내전시"] },
    { name: "비닐 현수막", price: "45,000원~", desc: "방수 비닐 소재 현수막", tags: ["#비닐", "#방수", "#야외용"] },
  ],
  "digital": [
    { name: "전단지 (소량)", price: "15,000원~", desc: "10부부터 가능한 전단지", tags: ["#소량인쇄", "#10부부터", "#디지털인쇄"] },
    { name: "포스터 (소량)", price: "25,000원~", desc: "1부부터 가능한 포스터", tags: ["#1부부터", "#소량포스터", "#디지털인쇄"] },
    { name: "리플렛 (소량)", price: "35,000원~", desc: "10부부터 가능한 리플렛", tags: ["#소량리플렛", "#10부부터", "#디지털인쇄"] },
    { name: "카탈로그 (소량)", price: "50,000원~", desc: "5부부터 가능한 카탈로그", tags: ["#소량카탈로그", "#5부부터", "#디지털인쇄"] },
    { name: "엽서·카드 (소량)", price: "20,000원~", desc: "소량 엽서 및 카드 인쇄", tags: ["#엽서", "#카드", "#소량"] },
  ],
  "20": [
    { name: "일반지 스티커 (원형)", price: "30,000원~", desc: "원형 커팅 일반지 스티커", tags: ["#원형커팅", "#일반지", "#다용도"], imageIdx: 0 },
    { name: "스티커 (사각)", price: "25,000원~", desc: "다양한 규격으로 주문 가능 합니다.", tags: ["#사각커팅", "#일반지", "#경제적"], imageIdx: 1 },
    { name: "특수지 스티커 (투명)", price: "45,000원~", desc: "투명 PET 소재 스티커", tags: ["#투명PET", "#특수지", "#고급스티커"], imageIdx: 2 },
    { name: "특수지 스티커 (은박)", price: "55,000원~", desc: "은박 소재 고급 스티커", tags: ["#은박소재", "#특수지", "#프리미엄"], imageIdx: 3 },
  ],
  "30": [
    { name: "대봉투 (A4)", price: "120,000원~", desc: "A4 서류용 대봉투", tags: ["#A4사이즈", "#서류용", "#대봉투"] },
    { name: "대봉투 (특대)", price: "150,000원~", desc: "특대 사이즈 대봉투", tags: ["#특대사이즈", "#대용량", "#대봉투"] },
    { name: "소봉투 (일반)", price: "80,000원~", desc: "일반 소봉투", tags: ["#일반형", "#소봉투", "#경제적"] },
    { name: "소봉투 (창봉투)", price: "95,000원~", desc: "주소 창이 있는 소봉투", tags: ["#창봉투", "#주소창", "#편리한발송"] },
  ],
  "40": [
    { name: "전단지 (A4)", price: "89,000원~", desc: "A4 사이즈 전단지", tags: ["#A4전단지", "#홍보용", "#대량인쇄"] },
    { name: "전단지 (A5)", price: "69,000원~", desc: "A5 사이즈 전단지", tags: ["#A5전단지", "#배포용", "#경제적"] },
    { name: "포스터 (A2)", price: "120,000원~", desc: "A2 대형 포스터", tags: ["#A2포스터", "#대형인쇄", "#게시용"] },
    { name: "포스터 (A1)", price: "180,000원~", desc: "A1 초대형 포스터", tags: ["#A1포스터", "#초대형", "#캠페인용"] },
    { name: "3단 리플렛", price: "249,000원~", desc: "3단 접지 리플렛", tags: ["#3단접지", "#리플렛", "#프로그램안내"] },
    { name: "4단 리플렛", price: "289,000원~", desc: "4단 접지 리플렛", tags: ["#4단접지", "#리플렛", "#상세안내"] },
    { name: "카다로그 (8p)", price: "450,000원~", desc: "8페이지 카다로그", tags: ["#8페이지", "#카다로그", "#사업안내"] },
    { name: "카다로그 (16p)", price: "680,000원~", desc: "16페이지 카다로그", tags: ["#16페이지", "#카다로그", "#종합안내"] },
  ],
  "50": [
    { name: "규격쇼핑백 (소)", price: "180,000원~", desc: "소형 규격 쇼핑백", tags: ["#소형", "#규격쇼핑백", "#실용적"] },
    { name: "규격쇼핑백 (대)", price: "220,000원~", desc: "대형 규격 쇼핑백", tags: ["#대형", "#규격쇼핑백", "#넉넉한사이즈"] },
    { name: "맞춤쇼핑백 (소)", price: "350,000원~", desc: "맞춤 디자인 소형 쇼핑백", tags: ["#맞춤디자인", "#소형", "#브랜딩"] },
    { name: "맞춤쇼핑백 (대)", price: "450,000원~", desc: "맞춤 디자인 대형 쇼핑백", tags: ["#맞춤디자인", "#대형", "#프리미엄"] },
  ],
  "60": [
    { name: "탁상용 캘린더 (기본)", price: "150,000원~", desc: "기본형 탁상 캘린더", tags: ["#탁상용", "#기본형", "#실용적"] },
    { name: "탁상용 캘린더 (고급)", price: "220,000원~", desc: "고급형 탁상 캘린더", tags: ["#탁상용", "#고급형", "#프리미엄"] },
    { name: "벽걸이 캘린더 (A3)", price: "280,000원~", desc: "A3 벽걸이 캘린더", tags: ["#벽걸이", "#A3", "#사무실용"] },
    { name: "벽걸이 캘린더 (A2)", price: "350,000원~", desc: "A2 대형 벽걸이 캘린더", tags: ["#벽걸이", "#A2대형", "#시인성좋은"] },
  ],
  "70": [
    { name: "디지털 전단지 (소량)", price: "15,000원~", desc: "10부부터 가능한 전단지", tags: ["#소량인쇄", "#10부부터", "#디지털인쇄"] },
    { name: "디지털 포스터 (소량)", price: "25,000원~", desc: "1부부터 가능한 포스터", tags: ["#1부부터", "#소량포스터", "#디지털인쇄"] },
    { name: "디지털 리플렛 (소량)", price: "35,000원~", desc: "10부부터 가능한 리플렛", tags: ["#소량리플렛", "#10부부터", "#디지털인쇄"] },
    { name: "디지털 카다로그 (소량)", price: "50,000원~", desc: "5부부터 가능한 카다로그", tags: ["#소량카다로그", "#5부부터", "#디지털인쇄"] },
  ],
  "4050": [
    { name: "금연성공 머그컵 (화이트)", price: "8,500원~", desc: "금연성공 축하 로고 인쇄 머그컵 (350ml)", tags: ["#머그컵", "#금연기념품", "#세라믹"], imageIdx: 0 },
    { name: "금연성공 머그컵 (블랙)", price: "9,000원~", desc: "블랙 무광택 금연성공 머그컵 (350ml)", tags: ["#머그컵", "#프리미엄", "#무광택"], imageIdx: 0 },
    { name: "금연성공 수첩 (A6)", price: "3,200원~", desc: "소프트 커버 금연성공 수첩 (A6, 100페이지)", tags: ["#수첩", "#금연기념품", "#소프트커버"], imageIdx: 1 },
    { name: "금연성공 수첩 (다이어리)", price: "4,500원~", desc: "달력 일체형 금연성공 다이어리", tags: ["#다이어리", "#달력일체형", "#연간기념품"], imageIdx: 1 },
    { name: "금연성공 에코백 (다이어리)", price: "6,800원~", desc: "친환경 면 소재 금연성공 에코백 (35x40cm)", tags: ["#에코백", "#친환경", "#면소재"], imageIdx: 2 },
    { name: "금연성공 에코백 (대형)", price: "8,200원~", desc: "대형 친환경 금연성공 에코백 (40x50cm)", tags: ["#에코백", "#대형", "#친환경"], imageIdx: 2 },
    { name: "금연성공 에코백 (지퍼러백)", price: "5,500원~", desc: "지퍼러 백 소재 금연성공 에코백", tags: ["#에코백", "#지퍼러백", "#실용적"], imageIdx: 2 },
    { name: "금연성공 텔러비전 (L)", price: "12,000원~", desc: "금연성공 로고 인쇄 텔러비전 (L사이즈)", tags: ["#텔러비전", "#금연기념품", "#실용적"], imageIdx: 3 },
    { name: "금연성공 텔러비전 (XL)", price: "14,500원~", desc: "금연성공 로고 인쇄 텔러비전 (XL사이즈)", tags: ["#텔러비전", "#XL사이즈", "#대형"], imageIdx: 3 },
    { name: "금연성공 배지 세트", price: "2,800원~", desc: "금연성공 기념 배지 3종 세트 - 프리미엄 금속 내구성 배지", tags: ["#배지", "#세트구성", "#기념품"], imageIdx: 4 },
    { name: "금연성공 타월포지", price: "5,000원~", desc: "금연성공 로고 인쇄 타월포지 (50x100cm)", tags: ["#타월포지", "#실용적", "#일상용품"], imageIdx: 5 },
    { name: "금연성공 동미세트", price: "3,500원~", desc: "금연성공 기념 동미세트 + 타월포지 세트", tags: ["#동미세트", "#세트구성", "#스포초용품"], imageIdx: 5 },
  ],
};

function getProductImage(categoryId: string, imageIdx?: number): string {
  // namecard 계열 → "10" 이미지 배열 사용
  // promo-leaflet 계열 → "promo-leaflet" 이미지 배열 사용
  let resolvedId = categoryId;
  if (categoryId === "namecard" || categoryId.startsWith("namecard-")) resolvedId = "10";
  else if (categoryId === "promo-leaflet") resolvedId = "promo-leaflet";
  else if (categoryId === "promo-poster") resolvedId = "promo-poster";
  else if (categoryId === "sticker-general") resolvedId = "sticker-general";
  else if (categoryId === "sticker-special") resolvedId = "sticker-special";
  else if (categoryId === "largeformat-banner") resolvedId = "largeformat-banner";
  else if (categoryId === "largeformat-xbanner") resolvedId = "largeformat-xbanner";
  const images = productImages[resolvedId];
  if (images && imageIdx !== undefined && images[imageIdx]) {
    return images[imageIdx];
  }
  // Fall back to parent category images
  const parentId = categoryId.substring(0, 2);
  const parentImages = productImages[parentId];
  if (parentImages && imageIdx !== undefined && parentImages[imageIdx]) {
    return parentImages[imageIdx];
  }
  return defaultProductImage;
}

// ── BizTabBar: 꺽쇠 버튼으로 탭 스크롤 ─────────────────────────────────
function BizTabBar({
  activeBizSub,
  setActiveBizSub,
  bizMenus,
}: {
  activeBizSub: string | null;
  setActiveBizSub: (id: string | null) => void;
  bizMenus: { id: string; name: string }[];
}) {
  const tabRef = useRef<HTMLDivElement>(null);
  const allTabs = [{ id: null as string | null, name: "전체보기" }, ...bizMenus];

  const scroll = (dir: "left" | "right") => {
    if (!tabRef.current) return;
    tabRef.current.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  return (
    <div className="bg-white border-b border-[#e5e5e7]">
      <div className="w-[70%] mx-auto flex items-center">
        {/* 왼쪽 꺽쇠 */}
        <button
          onClick={() => scroll("left")}
          className="shrink-0 px-3 py-3 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          aria-label="이전"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 탭 목록 - 스크롤바 숨김 */}
        <div
          ref={tabRef}
          className="flex items-center overflow-x-auto gap-0 flex-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {allTabs.map((tab) => (
            <button
              key={tab.id ?? "all"}
              onClick={() => setActiveBizSub(tab.id)}
              className={`shrink-0 px-5 py-3 text-[13px] border-b-2 transition-colors whitespace-nowrap ${
                activeBizSub === tab.id
                  ? "border-[#00A39B] text-[#00A39B] font-semibold"
                  : "border-transparent text-[#86868b] hover:text-[#1d1d1f] hover:border-[#d1d1d6] font-medium"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* 오른쪽 꺽쇠 */}
        <button
          onClick={() => scroll("right")}
          className="shrink-0 px-3 py-3 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          aria-label="다음"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── 미추홀보건소 명함 예시 데이터 (우리 보건소 명함 탭) ─────────────────────
const MICHUHOL_CARDS = [
  { id: 1,  dept: "건강증진과",   title: "과장",     name: "김진수",   phone: "032-880-4101", design: "H형", qty: 200, lastOrder: "2025-03-15" },
  { id: 2,  dept: "건강증진과",   title: "주임주의사", name: "박지연",   phone: "032-880-4102", design: "H형", qty: 100, lastOrder: "2025-03-15" },
  { id: 3,  dept: "건강증진과",   title: "주임상담사", name: "이수민",   phone: "032-880-4103", design: "H형", qty: 100, lastOrder: "2025-03-15" },
  { id: 4,  dept: "건강증진과",   title: "상담사",   name: "정현우",   phone: "032-880-4104", design: "A형", qty: 100, lastOrder: "2025-04-02" },
  { id: 5,  dept: "금연지원담당",  title: "담당주임",  name: "최은지",   phone: "032-880-4201", design: "B형", qty: 100, lastOrder: "2025-02-20" },
  { id: 6,  dept: "금연지원담당",  title: "주임간호사", name: "오세연",   phone: "032-880-4202", design: "B형", qty: 100, lastOrder: "2025-02-20" },
  { id: 7,  dept: "만성질환담당",  title: "담당주임",  name: "강동현",   phone: "032-880-4301", design: "C형", qty: 200, lastOrder: "2025-01-10" },
  { id: 8,  dept: "만성질환담당",  title: "주임의사",  name: "윤서연",   phone: "032-880-4302", design: "C형", qty: 100, lastOrder: "2025-01-10" },
  { id: 9,  dept: "만성질환담당",  title: "주임간호사", name: "임지현",   phone: "032-880-4303", design: "C형", qty: 100, lastOrder: "2025-01-10" },
  { id: 10, dept: "정신건강담당",  title: "담당주임",  name: "서민준",   phone: "032-880-4401", design: "D형", qty: 100, lastOrder: "2024-12-05" },
  { id: 11, dept: "정신건강담당",  title: "주임상담사", name: "한아름",   phone: "032-880-4402", design: "D형", qty: 100, lastOrder: "2024-12-05" },
  { id: 12, dept: "예방접종담당",  title: "담당주임",  name: "문지원",   phone: "032-880-4501", design: "E형", qty: 200, lastOrder: "2025-04-10" },
  { id: 13, dept: "예방접종담당",  title: "주임간호사", name: "박성현",   phone: "032-880-4502", design: "E형", qty: 100, lastOrder: "2025-04-10" },
  { id: 14, dept: "모자보건담당",  title: "담당주임",  name: "이은정",   phone: "032-880-4601", design: "F형", qty: 100, lastOrder: "2025-03-28" },
  { id: 15, dept: "모자보건담당",  title: "주임간호사", name: "조현정",   phone: "032-880-4602", design: "F형", qty: 100, lastOrder: "2025-03-28" },
  { id: 16, dept: "노인건강담당",  title: "담당주임",  name: "신재호",   phone: "032-880-4701", design: "G형", qty: 100, lastOrder: "2025-02-14" },
  { id: 17, dept: "노인건강담당",  title: "주임간호사", name: "권은혜",   phone: "032-880-4702", design: "G형", qty: 100, lastOrder: "2025-02-14" },
  { id: 18, dept: "구강보건담당",  title: "담당주임",  name: "이성민",   phone: "032-880-4801", design: "A형", qty: 100, lastOrder: "2025-01-22" },
  { id: 19, dept: "영양관리담당",  title: "담당주임",  name: "안서연",   phone: "032-880-4901", design: "B형", qty: 100, lastOrder: "2025-04-18" },
  { id: 20, dept: "지역보건실",    title: "실장",     name: "유민준",   phone: "032-880-5001", design: "H형", qty: 200, lastOrder: "2025-04-25" },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string;

  // 카테고리 ID → 주문 폼 URL 매핑
  const getOrderUrl = (categoryId: string): string => {
    // 명함 (신규 ID)
    if (categoryId === "namecard" || categoryId.startsWith("namecard-")) return "/order/namecard";
    // 명함 (구 ID)
    if (categoryId === "1010" || categoryId === "10") return "/order/namecard";
    // 스티커
    if (categoryId === "sticker" || categoryId.startsWith("sticker-") || categoryId.startsWith("20") || categoryId === "20") return "/order/product/sticker";
    // 일반서식/봉투
    if (categoryId === "form" || categoryId.startsWith("form-") || categoryId.startsWith("30") || categoryId === "30") return "/order/product/envelope";
    // 홍보물
    if (categoryId === "promo" || categoryId.startsWith("promo-") || categoryId.startsWith("40") || categoryId === "40") return "/order/product/campaign";
    // 쇼핑백
    if (categoryId.startsWith("50") || categoryId === "50") return "/order/product/shopping";
    // 캘린더
    if (categoryId === "calendar" || categoryId.startsWith("calendar-") || categoryId.startsWith("60") || categoryId === "60") return "/order/product/calendar";
    // 표지판
    if (categoryId === "signage" || categoryId.startsWith("signage-")) return "/order/product/signage";
    // 실사출력
    if (categoryId === "largeformat" || categoryId.startsWith("largeformat-")) return "/order/product/largeformat";
    // 소량인쇄
    if (categoryId === "digital" || categoryId.startsWith("digital-") || categoryId.startsWith("70") || categoryId === "70") return "/order/product/digital";
    // 사업별
    if (categoryId === "biz" || categoryId.startsWith("biz-") || categoryId.startsWith("80") || categoryId === "80") return "/order/product/campaign";
    // 금연성공 기념품
    if (categoryId === "4050") return "/order/product/gift";
    // 기본: 맞춤제작
    return "/custom-order";
  };

  // 사업별 서브메뉴 선택 상태
  const [activeBizSub, setActiveBizSub] = useState<string | null>(null);
  // 금연사업 장소 선택 상태 (null = 전체보기)
  const [activeGumyeonPlace, setActiveGumyeonPlace] = useState<string | null>(null);
  // 장소별 탭 스크롤 ref
  const gumyeonTabRef = useRef<HTMLDivElement>(null);
  const scrollGumyeonTab = (dir: "left" | "right") => {
    if (!gumyeonTabRef.current) return;
    gumyeonTabRef.current.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };
  // 장소별 탭 목록 (국민건강증진법 금연구역 기준 + 주요 부착 장소)
  const GUMYEON_PLACES = [
    { id: "공원", label: "공원" },
    { id: "학교", label: "학교" },
    { id: "아파트", label: "아파트" },
    { id: "병원", label: "병원" },
    { id: "유치원", label: "유치원" },
    { id: "주유소", label: "주유소" },
    { id: "지하철", label: "지하철" },
    { id: "버스정류장", label: "버스정류장" },
    { id: "택시승강장", label: "택시승강장" },
    { id: "음식점", label: "음식점" },
    { id: "PC방", label: "PC방" },
    { id: "편의점", label: "편의점" },
    { id: "도서관", label: "도서관" },
    { id: "체육시설", label: "체육시설" },
    { id: "어린이놀이터", label: "어린이놀이터" },
    { id: "관공서", label: "관공서" },
  ];
  // 포스터 페이지 카테고리 필터
  const [activePosterFilter, setActivePosterFilter] = useState<string>("전체보기");
  const [namecardSide, setNamecardSide] = useState<"front" | "back">("front");

  // 우리 보건소 명함 - 재주문 모달 상태
  const [selectedCenterCard, setSelectedCenterCard] = useState<typeof MICHUHOL_CARDS[0] | null>(null);
  const [centerCardModal, setCenterCardModal] = useState(false);
  // 우리 보건소 명함 - 검색 & 뷰 모드
  const [cardSearchQuery, setCardSearchQuery] = useState("");
  const [cardViewMode, setCardViewMode] = useState<"grid" | "list">("grid");
  const [cardListPage, setCardListPage] = useState(1);
  const CARD_LIST_PAGE_SIZE = 10;
  const [cardGridPage, setCardGridPage] = useState(1);
  const CARD_GRID_PAGE_SIZE = 12;
  // 이미지 그리드 뷰 - 필터링 및 페이지네이션 (컴포넌트 레벨)
  const gridFiltered = MICHUHOL_CARDS.filter(c =>
    !cardSearchQuery ||
    c.name.includes(cardSearchQuery) ||
    c.dept.includes(cardSearchQuery) ||
    c.title.includes(cardSearchQuery)
  );
  const gridTotalPages = Math.ceil(gridFiltered.length / CARD_GRID_PAGE_SIZE);
  const gridPaged = gridFiltered.slice((cardGridPage - 1) * CARD_GRID_PAGE_SIZE, cardGridPage * CARD_GRID_PAGE_SIZE);

  // 명함 카테고리 진입 시 표준명함을 기본으로 설정
  useEffect(() => {
    if (categoryId === "namecard") {
      // 명함 카테고리 진입 시 자동으로 표준명함으로 리다이렉트
      router.push("/category/namecard-standard");
    }
  }, [categoryId, router]);

  const result = findCategory(categoryId || "");

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">
            카테고리를 찾을 수 없습니다
          </h2>
          <Link href="/" className="text-[#00A39B] hover:underline text-[15px]">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { parent, sub } = result;
  // Use subcategory products if available, otherwise fall back to parent
  const categoryKey = sub ? sub.id : parent.id;
  const allProducts = sampleProducts[categoryKey] || sampleProducts[parent.id] || [];

  const products = allProducts;

  // Check if this is a parent category with a banner, or a campaign sub-category
  const banner = !sub
    ? categoryBanners[parent.id]
    : (subCategoryBanners[sub.id] || null);

  // ── 사업별(biz) 카테고리 특별 레이아웃 ──────────────────────────────
  const BIZ_MENUS = [
    { id: "8010", name: "금연 사업" },
    { id: "8020", name: "암 예방" },
    { id: "8030", name: "예방접종" },
    { id: "8040", name: "치매·정신건강" },
    { id: "8050", name: "노인 건강" },
    { id: "8060", name: "모자 보건" },
    { id: "8070", name: "신체활동" },
    { id: "8080", name: "심뇌혈관" },
    { id: "8090", name: "영양 관리" },
    { id: "8100", name: "정신건강" },
    { id: "8110", name: "구강 보건" },
    { id: "8120", name: "절주 사업" },
  ];

  if (categoryId === "biz") {
    const activeSub = activeBizSub ? BIZ_MENUS.find(m => m.id === activeBizSub) : null;
    const activeBanner = activeBizSub ? subCategoryBanners[activeBizSub] : null;
    return (
      <div>
        {/* 배너 */}
        <div className="w-full">
            <div className="relative w-full overflow-hidden" style={{height: 'clamp(150px, 20vw, 280px)'}}>
              <img
                src={(activeBanner || categoryBanners["biz"] || subCategoryBanners["8010"])?.image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=500&fit=crop"}
                alt="사업별"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-[1.75rem] md:text-[2.25rem] font-bold text-white tracking-tight drop-shadow">
                  {activeSub ? activeSub.name : "사업별"}
                </h1>
              </div>
            </div>
        </div>

        {/* 브레드크럼 */}
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="w-[70%] mx-auto py-2.5">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <button onClick={() => setActiveBizSub(null)} className={`transition-colors ${!activeBizSub ? "text-[#1d1d1f] font-medium" : "text-[#86868b] hover:text-[#00A39B]"}`}>사업별</button>
              {activeSub && (
                <>
                  <ChevronRight className="w-3 h-3 text-[#86868b]" />
                  <span className="text-[#1d1d1f] font-medium">{activeSub.name}</span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* 가로 탭 버튼 바 (브레드크럼 바로 아래) - 꺽쇠 버튼 방식 */}
        <BizTabBar
          activeBizSub={activeBizSub}
          setActiveBizSub={setActiveBizSub}
          bizMenus={BIZ_MENUS}
        />

        {/* 콘텐츠 영역 (전체 너비) */}
        <div className="bg-white py-8">
          <div className="w-[70%] mx-auto">
              {!activeBizSub ? (
                // 전체보기: 12개 사업 카드 그리드
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {BIZ_MENUS.map((menu) => {
                    const bizBanner = subCategoryBanners[menu.id];
                    return (
                      <motion.button
                        key={menu.id}
                        onClick={() => setActiveBizSub(menu.id)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group text-left bg-white rounded-t-none rounded-b-[7px] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                      >
                        {/* 이미지 영역 - 명함 카드와 동일한 스타일 */}
                        <div className="overflow-hidden w-full" style={{aspectRatio: '5 / 4.2'}}>
                          <img
                            src={bizBanner?.image || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=300&fit=crop"}
                            alt={menu.name}
                            className="w-full h-full object-cover scale-[1.3] group-hover:scale-[1.35] transition-transform duration-300"
                          />
                        </div>
                        {/* 텍스트 영역 */}
                        <div className="px-4 py-4">
                          <p className="text-[15px] font-bold text-[#1d1d1f] mb-1.5 leading-snug group-hover:text-[#00A39B] transition-colors">{menu.name}</p>
                          <p className="text-[13px] text-[#6e6e73] leading-relaxed line-clamp-2">{bizBanner?.subtitle || "캠페인 부착물 제작"}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                // 선택된 사업 콘텐츠
                <div>
                  <div className="mb-4">
                    <h2 className="text-[18px] font-bold text-[#1d1d1f] mb-1">{activeSub?.name}</h2>
                    <p className="text-[13px] text-[#86868b]">{activeBanner?.subtitle}</p>
                  </div>

                  {/* 금연사업: 장소별 탭 + 제작물 */}
                  {activeBizSub === "8010" ? (
                    <div>
                      {/* 장소 탭 바 */}
                      <div className="flex items-center gap-0 mb-6 border-b border-[#e5e5e7] pb-3">
                        {/* 왼쪽 꺽쇠 */}
                        <button
                          onClick={() => scrollGumyeonTab("left")}
                          className="shrink-0 px-1.5 py-1 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                          aria-label="이전"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {/* 탭 스크롤 영역 */}
                        <div
                          ref={gumyeonTabRef}
                          className="flex flex-nowrap gap-1.5 overflow-x-auto flex-1"
                          style={{scrollbarWidth:'none', msOverflowStyle:'none'}}
                        >
                          {/* 전체보기 버튼 */}
                          <button
                            onClick={() => setActiveGumyeonPlace(null)}
                            className={`shrink-0 px-3.5 py-1.5 text-[12px] font-medium transition-colors rounded-[7px] ${
                              activeGumyeonPlace === null
                                ? "bg-[#00A39B] text-white"
                                : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                            }`}
                          >
                            전체보기
                          </button>
                          {GUMYEON_PLACES.map((place) => (
                            <button
                              key={place.id}
                              onClick={() => setActiveGumyeonPlace(place.id)}
                              className={`shrink-0 px-3.5 py-1.5 text-[12px] font-medium transition-colors rounded-[7px] ${
                                activeGumyeonPlace === place.id
                                  ? "bg-[#00A39B] text-white"
                                  : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                              }`}
                            >
                              {place.label}
                            </button>
                          ))}
                        </div>
                        {/* 오른쪽 꺽쇠 */}
                        <button
                          onClick={() => scrollGumyeonTab("right")}
                          className="shrink-0 px-1.5 py-1 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                          aria-label="다음"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 제작물 목록 */}
                      {activeGumyeonPlace === null || activeGumyeonPlace === "공원" || activeGumyeonPlace === "학교" || activeGumyeonPlace === "아파트" || activeGumyeonPlace === "병원" || activeGumyeonPlace === "유치원" || activeGumyeonPlace === "주유소" || activeGumyeonPlace === "지하철" || activeGumyeonPlace === "버스정류장" || activeGumyeonPlace === "택시승강장" || activeGumyeonPlace === "음식점" || activeGumyeonPlace === "PC방" || activeGumyeonPlace === "편의점" || activeGumyeonPlace === "도서관" || activeGumyeonPlace === "체육시설" || activeGumyeonPlace === "어린이놀이터" || activeGumyeonPlace === "관공서" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {[
                            {
                              name: "금연구역 포스터 (가로형)",
                              size: "520×370mm",
                              price: "문의",
                              desc: "식당·PC방·커피숍·호프집 등 공공장소 금연구역 지정 가로형 포스터",
                              image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연_포스터_520X370-복사본_35ba5158.jpg",
                              tags: ["#포스터", "#가로형", "#금연구역"]
                            },
                            {
                              name: "금연구역 포스터 (세로형)",
                              size: "420×594mm",
                              price: "문의",
                              desc: "사람이 있는 곳이 대한민국 금연구역 세로형 포스터",
                              image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연_포스터420X594-복사본_9d516a52.jpg",
                              tags: ["#포스터", "#세로형", "#금연구역"]
                            },
                            {
                              name: "금연구역 버스 광고",
                              size: "버스 광고 규격",
                              price: "문의",
                              desc: "대중교통 버스 내·외부 금연구역 안내 광고 스티커",
                              image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연_포스터_버스-복사본_05aaadae.webp",
                              tags: ["#버스광고", "#스티커", "#대중교통"]
                            },
                            {
                              name: "건강한 학교 현판",
                              size: "300×255mm",
                              price: "문의",
                              desc: "담배연기 없는 건강한 학교 아크릴 돌출 도색 현판 (스텐 3T)",
                              image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/현판제작-복사본_dcfa2ae0.webp",
                              tags: ["#현판", "#아크릴", "#학교"]
                            },
                          ].map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="group bg-white rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                            >
                              <div className="overflow-hidden w-full" style={{aspectRatio: '5 / 4.2'}}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-300"
                                style={{transform: 'scale(1.2) translateY(-10px)', transformOrigin: '50% 50%'}}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.44) translateY(-10px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.2) translateY(-10px)')}
                                />
                              </div>
                              <div className="px-4 py-3">
                                <p className="text-[14px] font-bold text-[#1d1d1f] mb-0.5 leading-snug group-hover:text-[#00A39B] transition-colors">{item.name}</p>
                                <p className="text-[11px] text-[#86868b] mb-1">{item.size}</p>
                                <p className="text-[12px] text-[#6e6e73] leading-relaxed line-clamp-2 mb-2">{item.desc}</p>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-[#00A39B] bg-[#e6f7f6] px-1.5 py-0.5">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 border border-dashed border-[#e5e5e7]">
                          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-2">{activeGumyeonPlace} 장소 제작물 준비 중</h3>
                          <p className="text-[13px] text-[#86868b] mb-5">{activeGumyeonPlace} 금연사업 캠페인 부착물이 곧 등록될 예정입니다</p>
                          <a href="/custom-order" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded hover:bg-[#008f88] transition-colors">
                            주문제작 문의하기
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-dashed border-[#e5e5e7]">
                      <div className="w-14 h-14 rounded-xl bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-2">상품 준비 중입니다</h3>
                      <p className="text-[13px] text-[#86868b] mb-5">곧 다양한 {activeSub?.name} 캠페인 부착물이 등록될 예정입니다</p>
                      <Link href="/custom-order" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded hover:bg-[#008f88] transition-colors">
                        주문제작 문의하기 <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* printbank-style Banner: full-width, 100% responsive */}
      <div className="w-full">
          <div className="relative w-full overflow-hidden flex items-center justify-center" style={{height: 'clamp(160px, 22vw, 300px)', backgroundColor: '#c8c8c8'}}>
            {parent.id === 'namecard' && (
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/namecard-banner_d90fd9ae.webp"
                alt="명함 배너"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {parent.id !== 'namecard' && banner?.image && (
              <img
                src={banner.image}
                alt={`${parent.name} 배너`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0" style={{background: 'rgba(0,0,0,0.15)'}} />
            <h1 className="relative text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-white tracking-tight" style={{textShadow: '0 2px 8px rgba(0,0,0,0.35)', fontWeight: '500'}}>
              {banner?.title || parent.name}
            </h1>
          </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="w-[70%] mx-auto py-2.5">
          <nav className="flex items-center gap-1.5 text-[12px]">
            <button
              onClick={() => { history.back(); }}
              className="flex items-center gap-0.5 text-[#86868b] hover:text-[#00A39B] transition-colors mr-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>뒤로</span>
            </button>
            <span className="text-[#d2d2d7]">|</span>
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">
              홈
            </Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <Link
              href={`/category/${parent.id}`}
              className={`${
                sub ? "text-[#86868b] hover:text-[#00A39B]" : "text-[#1d1d1f] font-medium"
              } transition-colors`}
            >
              {parent.name}
            </Link>
            {sub && (
              <>
                <ChevronRight className="w-3 h-3 text-[#86868b]" />
                <span className="text-[#1d1d1f] font-medium">{sub.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 카테고리 서브 메뉴 탭 바 (브레드크럼 아래, 상품 목록 위) */}
      {parent.sub.length > 0 && (
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="w-[70%] mx-auto">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {parent.sub
                .filter((s) => s.id === "namecard-standard" || s.id === "namecard-regional")
                .map((s) => {
                  const href = `/category/${s.id}`;
                  const isActive = sub?.id === s.id;
                  return (
                    <Link
                      key={s.id}
                      href={href}
                      className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-full transition-all border ${
                        isActive
                          ? "bg-[#00A39B] text-white border-[#00A39B]"
                          : "bg-white text-[#424245] border-[#d2d2d7] hover:border-[#00A39B] hover:text-[#00A39B]"
                      }`}
                    >
                      {s.name}
                      {s.badge === "NEW" && (
                        <span className="ml-1.5 text-[10px] bg-[#00A39B] text-white px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="bg-white pt-4 pb-8 md:pb-12">
        <div className="w-[70%] mx-auto">

          {/* 명함 카테고리 섹션 타이틀 + 앞면/뒷면 탭 */}
          {categoryKey === "namecard-regional" && (
            <>
              {/* 주문제작 CTA 배너 (그리드 위) - rounded 박스 스타일 */}
              <div className="mb-6 rounded-2xl bg-[#EBF5F4] p-6 flex flex-col items-center text-center gap-2">
                <h2 className="text-[17px] font-bold text-[#1d1d1f]" style={{fontSize: '23px'}}>지금 쓰고 계시는 명함으로 제작을 원하시나요?</h2>
                <p className="text-[13px] text-[#86868b]" style={{fontSize: '18px'}}>기존 명함을 선택 후 재 발주하거나 수정 발주가 가능 합니다.</p>

              </div>

              {/* 우리 보건소 명함 - 미추홀보건소 예시 20개 */}
              <div className="mb-6">
                {/* 헤더: 제목 + 총 수량 + 검색 + 뷰 전환 */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-[20px] font-bold text-[#1d1d1f]">미추홀보건소 명함 제작 이력</h2>
                      <span className="text-[12px] text-[#86868b] bg-[#f5f5f7] px-3 py-1 rounded-full">
                        총 {MICHUHOL_CARDS.length}명
                      </span>
                    </div>
                    {/* 뷰 전환 버튼 */}
                    <div className="flex items-center gap-1 bg-[#f5f5f7] rounded-lg p-0.5">
                      <button
                        onClick={() => setCardViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                          cardViewMode === "grid" ? "bg-white text-[#00A39B] shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        이미지
                      </button>
                      <button
                        onClick={() => setCardViewMode("list")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                          cardViewMode === "list" ? "bg-white text-[#00A39B] shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        목록
                      </button>
                    </div>
                  </div>
                  {/* 검색창 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <input
                      type="text"
                      placeholder="이름, 부서, 직책으로 검색..."
                      value={cardSearchQuery}
                      onChange={e => { setCardSearchQuery(e.target.value); setCardListPage(1); setCardGridPage(1); }}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#d2d2d7] rounded-xl text-[13px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#00A39B] focus:ring-1 focus:ring-[#00A39B]/30 bg-white"
                    />
                    {cardSearchQuery && (
                      <button
                        onClick={() => { setCardSearchQuery(""); setCardListPage(1); setCardGridPage(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 이미지 그리드 뷰 */}
                {cardViewMode === "grid" && (
                  <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gridPaged.map((card) => (
                      <motion.button
                        key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: card.id * 0.03, duration: 0.3 }}
                        onClick={() => { setSelectedCenterCard(card); setCenterCardModal(true); }}
                        className="group text-left bg-white hover:shadow-md transition-all duration-200"
                      >
                        {/* 명함 이미지 영역 (9:5 비율) */}
                        <div className="w-full overflow-hidden relative" style={{aspectRatio: '9/5', border: '1px solid #d1d1d6'}}>
                          <img
                            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/SampleNamecard_a7d97e5d.png"
                            alt="명함 샘플"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-bold text-white bg-[#00A39B] px-2 py-0.5 rounded-full shadow">{card.design}</span>
                          </div>
                        </div>
                        {/* 명함 정보 */}
                        <div className="p-3">
                          <p className="text-[12px] text-[#86868b] truncate">{card.dept}</p>
                          <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{card.title} {card.name}</p>
                          <p className="text-[11px] text-[#86868b] mt-0.5 truncate">{card.phone}</p>
                          <p className="text-[11px] text-[#00A39B] mt-1 font-medium">{card.qty}매 · {card.lastOrder}</p>
                        </div>
                        {/* 호버 오버레이 */}
                        <div className="px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <span className="flex-1 text-center text-[10px] font-semibold text-[#00A39B] bg-[#00A39B]/10 py-1 rounded">재주문</span>
                            <span className="flex-1 text-center text-[10px] font-semibold text-[#5B9BD5] bg-[#5B9BD5]/10 py-1 rounded">수정발주</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {/* 이미지 뷰 페이지네이션 */}
                  {gridTotalPages > 1 && (
                    <div className="flex items-center justify-center px-4 py-3 border-t border-[#d2d2d7] bg-white" style={{borderRadius: '2px'}}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCardGridPage(p => Math.max(1, p - 1))}
                          disabled={cardGridPage === 1}
                          className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[#d2d2d7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f7] transition-colors"
                        >이전</button>
                        {Array.from({ length: gridTotalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCardGridPage(page)}
                            className={`w-8 h-8 text-[12px] font-medium rounded-full transition-colors ${
                              page === cardGridPage
                                ? 'bg-[#00A39B] text-white'
                                : 'border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f]'
                            }`}
                          >{page}</button>
                        ))}
                        <button
                          onClick={() => setCardGridPage(p => Math.min(gridTotalPages, p + 1))}
                          disabled={cardGridPage === gridTotalPages}
                          className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[#d2d2d7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f7] transition-colors"
                        >다음</button>
                      </div>
                    </div>
                  )}
                  </>
                )}

                {/* 리스트(엑셀) 뷰 */}
                {cardViewMode === "list" && (
                  <div className="border-t border-[#d2d2d7] overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-[#f5f5f7] border-b border-[#d2d2d7]">
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f] w-8">No.</th>
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f]">부서</th>
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f]">직책</th>
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f]">이름</th>
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f]">전화번호</th>
                          <th className="text-left px-4 py-3 font-semibold text-[#1d1d1f]">디자인</th>
                          <th className="text-right px-4 py-3 font-semibold text-[#1d1d1f]">제작수량</th>
                          <th className="text-right px-4 py-3 font-semibold text-[#1d1d1f]">최근발주일</th>
                          <th className="text-center px-4 py-3 font-semibold text-[#1d1d1f]">주문</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MICHUHOL_CARDS.filter(c =>
                          !cardSearchQuery ||
                          c.name.includes(cardSearchQuery) ||
                          c.dept.includes(cardSearchQuery) ||
                          c.title.includes(cardSearchQuery)
                        ).slice((cardListPage - 1) * CARD_LIST_PAGE_SIZE, cardListPage * CARD_LIST_PAGE_SIZE).map((card, idx) => (
                          <tr
                            key={card.id}
                            className={`border-b border-[#f0f0f0] hover:bg-[#f9f9fb] transition-colors cursor-pointer ${
                              idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                            }`}
                            onClick={() => { setSelectedCenterCard(card); setCenterCardModal(true); }}
                          >
                            <td className="px-4 py-3 text-[#86868b]">{card.id}</td>
                            <td className="px-4 py-3 text-[#1d1d1f]">{card.dept}</td>
                            <td className="px-4 py-3 text-[#515154]">{card.title}</td>
                            <td className="px-4 py-3 font-semibold text-[#1d1d1f]">{card.name}</td>
                            <td className="px-4 py-3 text-[#515154]">{card.phone}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] font-semibold text-[#00A39B] bg-[#00A39B]/10 px-2 py-0.5 rounded-full">{card.design}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#1d1d1f]">{card.qty.toLocaleString()}매</td>
                            <td className="px-4 py-3 text-right text-[#86868b]">{card.lastOrder}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-center">
                                <button
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#00A39B] bg-[#00A39B]/10 rounded hover:bg-[#00A39B]/20 transition-colors"
                                  onClick={e => { e.stopPropagation(); setSelectedCenterCard(card); setCenterCardModal(true); }}
                                >재주문</button>
                                <button
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#5B9BD5] bg-[#5B9BD5]/10 rounded hover:bg-[#5B9BD5]/20 transition-colors"
                                  onClick={e => { e.stopPropagation(); setSelectedCenterCard(card); setCenterCardModal(true); }}
                                >수정발주</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#f5f5f7] border-t border-[#d2d2d7]">
                          <td colSpan={6} className="px-4 py-3 text-[12px] font-semibold text-[#515154]">
                            전체 합계 &nbsp;
                            <span className="text-[#00A39B] font-bold">
                              {MICHUHOL_CARDS.filter(c =>
                                !cardSearchQuery ||
                                c.name.includes(cardSearchQuery) ||
                                c.dept.includes(cardSearchQuery) ||
                                c.title.includes(cardSearchQuery)
                              ).length}건
                            </span>
                          </td>
                          <td className="px-4 py-3" />
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                    {/* 페이지네이션 */}
                    {(() => {
                      const filtered = MICHUHOL_CARDS.filter(c =>
                        !cardSearchQuery ||
                        c.name.includes(cardSearchQuery) ||
                        c.dept.includes(cardSearchQuery) ||
                        c.title.includes(cardSearchQuery)
                      );
                      const totalPages = Math.ceil(filtered.length / CARD_LIST_PAGE_SIZE);
                      if (totalPages <= 1) return null;
                      return (
                        <div className="flex items-center justify-center px-4 py-3 border-t border-[#d2d2d7] bg-white">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCardListPage(p => Math.max(1, p - 1))}
                              disabled={cardListPage === 1}
                              className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[#d2d2d7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f7] transition-colors"
                            >이전</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCardListPage(page)}
                                className={`w-8 h-8 text-[12px] font-medium rounded-lg transition-colors ${
                                  page === cardListPage
                                    ? "bg-[#00A39B] text-white"
                                    : "border border-[#d2d2d7] text-[#515154] hover:bg-[#f5f5f7]"
                                }`}
                              >{page}</button>
                            ))}
                            <button
                              onClick={() => setCardListPage(p => Math.min(totalPages, p + 1))}
                              disabled={cardListPage === totalPages}
                              className="px-3 py-1.5 text-[12px] font-medium rounded-lg border border-[#d2d2d7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f5f5f7] transition-colors"
                            >다음</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 재주문/수정발주 모달 */}
              {centerCardModal && selectedCenterCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCenterCardModal(false)}>
                  <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f]">명함 주문 선택</h3>
                      <button onClick={() => setCenterCardModal(false)} className="text-[#86868b] hover:text-[#1d1d1f]">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* 선택된 명함 정보 */}
                    <div className="bg-[#f5f5f7] rounded-xl p-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#00A39B]/15 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-[#00A39B]" />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[#1d1d1f]">{selectedCenterCard.name}</p>
                          <p className="text-[13px] text-[#86868b]">{selectedCenterCard.dept} · {selectedCenterCard.title}</p>
                          <p className="text-[12px] text-[#86868b] mt-0.5">{selectedCenterCard.phone}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#e5e5e7] flex items-center gap-2">
                        <span className="text-[11px] text-[#86868b]">적용 디자인</span>
                        <span className="text-[11px] font-semibold text-[#00A39B] bg-[#00A39B]/10 px-2 py-0.5 rounded-full">표준명함 {selectedCenterCard.design}</span>
                      </div>
                    </div>

                    {/* 주문 방식 선택 */}
                    <div className="space-y-3">
                      <a
                        href={`/order/namecard?front=${encodeURIComponent(selectedCenterCard.design.replace('형','형'))}&reorder=true&name=${encodeURIComponent(selectedCenterCard.name)}&dept=${encodeURIComponent(selectedCenterCard.dept)}&title=${encodeURIComponent(selectedCenterCard.title)}&phone=${encodeURIComponent(selectedCenterCard.phone)}`}
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-[#00A39B] bg-[#00A39B]/5 hover:bg-[#00A39B]/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#00A39B] flex items-center justify-center shrink-0">
                          <RefreshCw className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#00A39B]">동일 내용으로 재주문</p>
                          <p className="text-[12px] text-[#86868b]">이름·부서·디자인 동일하게 재주문</p>
                        </div>
                      </a>
                      <a
                        href={`/order/namecard?front=${encodeURIComponent(selectedCenterCard.design.replace('형','형'))}&template=true&dept=${encodeURIComponent(selectedCenterCard.dept)}`}
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-[#5B9BD5] bg-[#5B9BD5]/5 hover:bg-[#5B9BD5]/10 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#5B9BD5] flex items-center justify-center shrink-0">
                          <Edit3 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#5B9BD5]">동일 디자인으로 수정 발주</p>
                          <p className="text-[12px] text-[#86868b]">같은 템플릿으로 다른 사람 명함 제작</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {categoryKey === "namecard-standard" && (
            <>
            {/* 기존 명함 디자인 배너 */}
            <div className="mb-5">
              <div className="rounded-2xl border border-[#00A39B]/20 bg-gradient-to-r from-[#00A39B]/5 to-[#00A39B]/10 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[17px] font-bold text-[#00A39B] mb-0.5">현재 사용 중인 명함 디자인이 있으신가요?</p>
                  <p className="text-[12px] text-[#424245]">기존 명함 디자인을 업로드하거나, 등록된 디자인으로 바로 주문할 수 있습니다.</p>
                </div>
                <a
                  href="/my-namecard-design"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A39B] text-white text-[12px] font-semibold hover:bg-[#008f88] transition-colors whitespace-nowrap"
                >
                  기존 디자인 주문하기 →
                </a>
              </div>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex rounded-full overflow-hidden border border-[#d2d2d7]" style={{fontSize: '13px'}}>
                <button
                  onClick={() => setNamecardSide("front")}
                  className={`px-4 py-1.5 font-medium transition-colors ${
                    namecardSide === "front" ? "bg-[#00A39B] text-white" : "bg-white text-[#515154] hover:text-[#1d1d1f]"
                  }`}
                >앞면 (8종)</button>
                <button
                  onClick={() => setNamecardSide("back")}
                  className={`px-4 py-1.5 font-medium transition-colors ${
                    namecardSide === "back" ? "bg-[#00A39B] text-white" : "bg-white text-[#515154] hover:text-[#1d1d1f]"
                  }`}
                >뒷면 (4종)</button>
              </div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">
                {namecardSide === "front" ? "표준명함 앞면" : "표준명함 뒷면"}
              </h2>
              <span className="text-[14px] text-[#86868b] leading-snug">
                {namecardSide === "front"
                  ? "뒷면 디자인은 앞면 디자인을 선택하시면 적용하실 수 있습니다."
                  : "앞면 디자인을 선택하시면 뒷면 디자인을 적용하실 수 있습니다."}
              </span>
            </div>
            </>
          )}

          {/* 포스터 카테고리 필터 버튼 (promo-poster 전용) */}
          {categoryKey === "promo-poster" && (
            <div className="flex flex-wrap gap-2 mb-6">
              {["전체보기", "세계 금연의날", "아파트", "학교", "유아시설"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivePosterFilter(filter)}
                  className={`px-4 py-1.5 text-[13px] font-medium transition-colors border ${
                    activePosterFilter === filter
                      ? "bg-[#00A39B] text-white border-[#00A39B]"
                      : "bg-white text-[#515154] border-[#d2d2d7] hover:border-[#00A39B] hover:text-[#00A39B]"
                  }`}
                  style={{ borderRadius: "7px" }}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          {/* 명함 뒷면 탭 선택 시 뒷면 4종 그리드 */}
          {(categoryKey === "namecard" || categoryKey.startsWith("namecard-")) && namecardSide === "back" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "표준명함 뒷면 A Type", desc: "포인트 컴러 배경의 뒷면 디자인", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면A_6ff240da.png" },
                { name: "표준명함 뒷면 B Type", desc: "심플한 로고 중앙 배치 뒷면 디자인", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면B_8f7b4c74.png" },
                { name: "표준명함 뒷면 C Type", desc: "기관 로고 2개 병렬 배치 뒷면 디자인", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면C_52cc19b5.png" },
                { name: "표준명함 뒷면 D Type", desc: "영문 정보 포함 프리미엄 뒷면 디자인", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면D_f8766039.png" },
              ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group bg-white rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-[#e5e5e7]"
                    onClick={() => alert('표준 명함 앞면 선택 시 명함 뒷면을 선택 할 수 있습니다.')}
                  >
                  <div className="relative overflow-hidden w-full" style={{aspectRatio: '5 / 4.2'}}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300"
                            style={{transform: 'scale(1.2) translateY(-10px)', transformOrigin: '50% 50%'}}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.44) translateY(-10px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.2) translateY(-10px)')}
                            />
                    {/* Hover Overlay with Text Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-200 text-xs leading-tight line-clamp-2 mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-4 hidden">
                    <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1.5 leading-snug group-hover:text-[#00A39B] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-[#6e6e73] leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 앞면 탭 또는 비명함 카테고리 상품 그리드 */}
          {/* 비명함 카테고리: 기존 디자인 주문하기 배너 */}
          {!(categoryKey === "namecard" || categoryKey.startsWith("namecard-")) && (
            <div className="mb-5">
              <div className="rounded-2xl border border-[#00A39B]/20 bg-gradient-to-r from-[#00A39B]/5 to-[#00A39B]/10 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold text-[#00A39B] mb-0.5">이전에 주문하셨던 디자인이 있으신가요?</p>
                  <p className="text-[12px] text-[#424245]">기존 디자인을 업로드하거나, 등록된 디자인으로 바로 주문할 수 있습니다.</p>
                </div>
                <a
                  href="/my-namecard-design"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00A39B] text-white text-[12px] font-semibold hover:bg-[#008f88] transition-colors whitespace-nowrap"
                >
                  기존 디자인 주문하기 →
                </a>
              </div>
            </div>
          )}


          {(!(categoryKey === "namecard" || categoryKey.startsWith("namecard-")) || (namecardSide === "front" && categoryKey !== "namecard-regional")) && (
          <div className={`grid gap-4 ${
            (categoryKey === "namecard" || categoryKey.startsWith("namecard-"))
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : (categoryKey === "sticker" || categoryKey.startsWith("sticker-"))
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          }`}>
              {(categoryKey === "promo-poster"
                ? (activePosterFilter === "전체보기"
                    ? products
                    : products.filter(p => (p.tags ?? []).some(t => t.replace(/#/g, "").includes(activePosterFilter.replace(/ /g, ""))))  )
                : products
              ).map((product, i) => {
                // 명함 카테고리: 앞면 타입 파라미터 추가
                const baseOrderUrl = getOrderUrl(params.id || "");
                const isNamecardCategory = categoryKey === "namecard" || categoryKey.startsWith("namecard-");
                const frontLabel = product.name.includes("A Type") ? "A형"
                  : product.name.includes("B Type") ? "B형"
                  : product.name.includes("C Type") ? "C형"
                  : product.name.includes("D Type") ? "D형"
                  : product.name.includes("E Type") ? "E형"
                  : product.name.includes("F Type") ? "F형"
                  : product.name.includes("G Type") ? "G형"
                  : product.name.includes("H Type") ? "H형"
                  : null;
                const orderUrl = isNamecardCategory && frontLabel
                  ? `${baseOrderUrl}?front=${encodeURIComponent(frontLabel)}`
                  : baseOrderUrl;
                
                return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`group bg-white rounded-none shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-[#e5e5e7] relative sticker-card-${i} ${
                    (categoryKey === "namecard" || categoryKey.startsWith("namecard-")) ? '' : ''
                  }`}
                  ref={(el) => {
                    // Ref callback for card element
                  }}
                >
                  <Link href={orderUrl} className="block h-full relative">
                    {/* Product Image - Masonry layout */}
                    <div className="overflow-hidden w-full" style={{aspectRatio: (categoryKey === "namecard" || categoryKey.startsWith("namecard-")) ? '5/3.8' : '1', minHeight: 'auto'}}>
                      <img
                        src={getProductImage(categoryKey, product.imageIdx)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300"
                        style={{transform: (categoryKey === "namecard" || categoryKey.startsWith("namecard-")) ? 'scale(1.2) translateY(-10px)' : 'scale(1.0)', transformOrigin: '50% 50%', paddingRight: '5px'}}
                        onMouseEnter={e => {
                          if (categoryKey === "namecard" || categoryKey.startsWith("namecard-")) {
                            e.currentTarget.style.transform = 'scale(1.44) translateY(-10px)';
                          } else if (categoryKey === "sticker" || categoryKey.startsWith("sticker-")) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (categoryKey === "namecard" || categoryKey.startsWith("namecard-")) {
                            e.currentTarget.style.transform = 'scale(1.2) translateY(-10px)';
                          } else if (categoryKey === "sticker" || categoryKey.startsWith("sticker-")) {
                            e.currentTarget.style.transform = 'scale(1.0)';
                          }
                        }}
                      />
                    </div>
                    
                    {/* Hover Overlay with Text Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      {product.desc && (
                        <p className="text-gray-200 text-xs leading-tight line-clamp-2 mt-1">
                          {product.desc}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
                );
              })}
          </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
                상품 준비 중입니다
              </h3>
              <p className="text-[14px] text-[#86868b]">
                곧 다양한 상품이 등록될 예정입니다
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA - namecard-regional 탭에서는 숨김 */}
      {categoryKey !== "namecard-regional" && (() => {
        const ctaMap: Record<string, { title: string; desc: string }> = {
          namecard:    { title: "지금 쓰고 계시는 명함으로 제작을 원하시나요?", desc: "맞춤 명함 제작 문의를 통해 원하시는 명함을 제작해 드립니다" },
          sticker:     { title: "맞춤 스티커 제작을 원하시나요?", desc: "일반지부터 특수지까지 다양한 스티커를 맞춤 제작해 드립니다" },
          form:        { title: "보건소 전용 서식을 맞춤 제작하실 수 있습니다", desc: "빌지에서 증명서까지 보건소에 필요한 모든 서식을 맞춤 제작해 드립니다" },
          promo:       { title: "효과적인 홈보물 제작을 원하시나요?", desc: "포스터에서 카탈로그까지 보건소 홈보에 최적화된 인쇄물을 제작해 드립니다" },
          calendar:    { title: "보건소 로고가 담긴 캘린더를 맞춤 제작하세요", desc: "탁상용부터 벽걸이용까지 다양한 캘린더를 맞춤 제작해 드립니다" },
          signage:     { title: "보건소 표지판을 맞춤 제작하실 수 있습니다", desc: "문패에서 아크릴 표지판까지 보건소에 필요한 표지판을 맞춤 제작해 드립니다" },
          largeformat: { title: "대형 실사출력이 필요하실 때", desc: "현수막부터 캔버스 출력까지 대형 인쇄물을 전문적으로 제작해 드립니다" },
          digital:     { title: "소량으로도 고품질 인쇄물을 제작하세요", desc: "디지털 인쇄로 소량부터 대량까지 빠르고 정확하게 제작해 드립니다" },
        };
        const cta = ctaMap[parent.id] ?? { title: "맞춤 제작을 원하시나요?", desc: "맞춤 제작 문의를 통해 원하시는 인쇄물을 제작해 드립니다" };
        return (
          <section className="bg-white py-16 md:py-20">
            <div className="w-[70%] mx-auto text-center">
              <h2 className="text-[clamp(1.25rem,3vw,2rem)] font-bold tracking-tight text-[#1d1d1f] mb-3">
                {cta.title}
              </h2>
              <p className="text-[15px] text-[#86868b] mb-6">
                {cta.desc}
              </p>
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20"
              >
                주문제작 문의하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        );
      })()}
    </div>
  );
}

