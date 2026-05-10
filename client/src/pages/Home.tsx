/*
 * Design: "Clean Canvas" — Apple Store Style
 * - Full-width hero with large typography
 * - Category cards with hover lift effect
 * - Featured products carousel
 * - Service features section
 * - Trust/about section
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  Truck,
  Shield,
  Clock,
  Award,
  Palette,
  Printer,
  Phone,
} from "lucide-react";
import { categories } from "@/data/categories";
import { useAuth } from "@/_core/hooks/useAuth";

const HERO_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/LLfMgrktfIhGXDCccVh1Mh-img-1_1771713170000_na1fn_aGVyby1iYW5uZXI.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0xMZk1ncmt0ZkloR1hEQ2NjVmgxTWgtaW1nLTFfMTc3MTcxMzE3MDAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEkuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=DDilSWVKQ~DZ-lhpw5stnfAphurozyyW~CdhhQjsKPcasl2WI~xonIvv2PhX9UsbZswPq-H7gSWcgq7azAH0NYfj6KZxlClnwgXqYTy5kACrNexakJN8UHlHe4fjs8zimwxX5m4sKP~BnkFxW3aHREFb58cPPVX~-NIpnPd7qV1QXt6vYwiZa~t94Xayl-qC8wXoLrb5-grHVcnSSFSgFPMltNcXD~5jBL8VlNklJ1HpQXSe~evN3O64ZFEqyhz60GXejJJanrcIVSDuTSzjTVKYDlQm0-GA4vdiDzH~m4Cv1ET1fqW0SnzjEKlG3lmmdkSMgsdX~Tp56zMsaU8Fxg__";

const CATEGORY_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/LLfMgrktfIhGXDCccVh1Mh-img-2_1771713186000_na1fn_Y2F0ZWdvcnktY2FyZHM.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0xMZk1ncmt0ZkloR1hEQ2NjVmgxTWgtaW1nLTJfMTc3MTcxMzE4NjAwMF9uYTFmbl9ZMkYwWldkdmNua3RZMkZ5WkhNLmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=t-jZGX4v8V-CZpTprgi4DIu461asfbc4fE5PeIjxkcABC3zwOdDEIH5soohh5yebwVxfqz~grtz9fleiahH77E6PiduGJCqCEvtyirZk53ZbsnIPMkqUdlzsZgYqVbktUuE0axpvo8q~3Kw~sIWaaA1qeoACHMVYOhNtV7VXFdJSGDvEaVfcaRx5Ohjlexmu8Rzza7F0TONzhoJJOE33n9nZqAitSSX1RnQmHvGDojGL19m0c~RNjIR0E~bdBK-siFJiO3gFg~PcQAiSAF304u8SdVcC20A2nMqn-zsLQeCvepI-Tbfp7~XFuQrM4y7mhHffURUDrpymBWWipxSajA__";

const PRINTING_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/LLfMgrktfIhGXDCccVh1Mh-img-3_1771713179000_na1fn_cHJpbnRpbmctZGV0YWls.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0xMZk1ncmt0ZkloR1hEQ2NjVmgxTWgtaW1nLTNfMTc3MTcxMzE3OTAwMF9uYTFmbl9jSEpwYm5ScGJtY3RaR1YwWVdscy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=O1ZM5TYpFs4DcA9~he2wNpxdm8wT~1OrEmCsydIG0QuElKWpVcyMDPxndK4~~5JHLc38E22Bt4LpV8v79eQnuYeqLDmFhubjZQILeh3lCgh1r~-aphU7~vxUh6FitiA~Yo9cSQep7vcM5Yj96FUnty7DF~RNsgxAVQ0nyhIdq19MnuFDLucHb8yNxaCSpmnNT6XUVhlz4YAZAPN5qmpbx3aBUlc56ooZ~HVEpB5ei79RZrzIgntoRvxMLLxwDaMKXG8bFnNL1f7gajfbkK-qsAWokSum9gmXYveS7vJLDDg9uX18vTNZpsc80DtAqmwmJKOPMFCQMHbFwmrvtxhhgw__";

const SERVICE_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/LLfMgrktfIhGXDCccVh1Mh-img-4_1771713174000_na1fn_c2VydmljZS1xdWFsaXR5.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0xMZk1ncmt0ZkloR1hEQ2NjVmgxTWgtaW1nLTRfMTc3MTcxMzE3NDAwMF9uYTFmbl9jMlZ5ZG1salpTMXhkV0ZzYVhSNS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=C-LqjV~SCMJT~9aH66o0BMK7hDs~GFRLn5gAsQaw13atOjE2FXl0ypqhUKkUfrWP~g1APpcopXVr049yZsTY9WL-Uz1q54MDp8tRVA7esUdk1QUQD2KxwBuo6qoMRTqkz7CMVjCBVg~MV-bwD5hsRK9WkYYDZgVh7NmefsXVzfQ3LDWxDHAnGKYvJ5xxw7OMCGkkDRkCxivrjO-nZy~Iy4ZmQ-eW9yDfTEz83S8rv2vUT3T751OfJXfVNrIGrPxzjdOHXNzsbUM2NXHcC7bHaKNoBYwL~8jLFEa7stOv9Ahd6mnTYzfgbiqfVWVlE-2NVke1KIgMAqv6hB2SE1oDmA__";

const ABOUT_IMG =
  "https://private-us-east-1.manuscdn.com/sessionFile/bfVQwBwoKEQLXDEmfOV19M/sandbox/LLfMgrktfIhGXDCccVh1Mh-img-5_1771713188000_na1fn_YWJvdXQtdHJ1c3Q.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYmZWUXdCd29LRVFMWERFbWZPVjE5TS9zYW5kYm94L0xMZk1ncmt0ZkloR1hEQ2NjVmgxTWgtaW1nLTVfMTc3MTcxMzE4ODAwMF9uYTFmbl9ZV0p2ZFhRdGRISjFjM1EuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=YxM98UX17gydM~ZgMHB17DAxIAJDmwI5PSp9OlB9hcJTMzA4oauaIYynsx9vQmsAIrnNpP599ZDy27OUURBzbrBbUh3cpH3pdA2OvmIxWxc5FrVfjgYNYZluRGQcj1iIYIThT0kFOwASkIrX6QoYQaWc-Fb-gGIsfK0VLVMNNEpDycoFzPGM4ya7y4o3BigT4ZohYi-X8cmjOISSNpMYbccW7bIaz2KL9ybdQ1nTPQ-PQepMz6lYCnBkIP2CB5Mnw54~g4SMD-hjGG19PmO~tx5PdzcDNhqgUBBF73Uql1XWwynG9Mc3yI3VGQbObn5-zLprThxPnVmnd~9Xr3B75g__";

// Category card data with Unsplash images for individual categories
const categoryCards = [
  {
    ...categories[0],
    description: "기본명함부터 고급명함까지",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/앞면01_f68712f4.png",
    color: "#EEF4FB",
  },
  {
    ...categories[1],
    description: "일반지, 특수지 스티커",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&h=400&fit=crop&q=80",
    color: "#FEF5EC",
  },
  {
    ...categories[2],
    description: "대봉투, 소봉투 맞춤 제작",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600&h=400&fit=crop&q=80",
    color: "#EDF7EE",
  },
  {
    ...categories[3],
    description: "전단지, 포스터, 리플렛, 카다로그",
    image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop&q=80",
    color: "#FDF0F3",
  },
  {
    ...categories[4],
    description: "규격 및 맞춤 쇼핑백",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=80",
    color: "#F5EFF8",
  },
  {
    ...categories[5],
    description: "탁상용, 벽걸이용 캘린더",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop&q=80",
    color: "#FEFAED",
  },
  {
    ...categories[6],
    description: "소량도 가능한 디지털 인쇄",
    image: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=600&h=400&fit=crop&q=80",
    color: "#ECF5F4",
  },
];

const featuredProducts = [
  {
    name: "카다로그",
    price: "450,000원~",
    description: "보건소 사업 안내에 최적화된 프리미엄 카다로그",
    tag: "BEST",
  },
  {
    name: "3단 리플렛",
    price: "249,000원~",
    description: "건강 프로그램 홍보에 효과적인 3단 리플렛",
    tag: "인기",
  },
  {
    name: "고급명함",
    price: "35,000원~",
    description: "보건소 직원을 위한 고급 명함",
    tag: "NEW",
  },
  {
    name: "대형 포스터",
    price: "89,000원~",
    description: "건강 캠페인 홍보용 대형 포스터",
    tag: "추천",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">
            {/* Left: Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="py-16 lg:py-0"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00A39B]/8 rounded-full mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A39B]" />
                <span className="text-[12px] font-medium text-[#00A39B] tracking-wide">
                  보건소 전문 인쇄 파트너
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-extrabold leading-[1.1] tracking-tight text-[#1d1d1f] mb-5" style={{fontSize: "47px"}}
              >
                더 빠르고 정확하게 만드는
                <br />
                <span className="text-[#00A39B]">인쇄정보 플랫폼</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-[17px] md:text-[19px] text-[#424245] leading-relaxed mb-8 max-w-lg"
              >
                제작 이력부터 연간 업무 현황까지,
                이력과 현황을 함께 관리하는 고품격 운영 시스템
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-3"
              >
                {/* 맞춤 주문 신청 버튼 - 일시 삭제 (보관 중)
                <Link
                  href="/custom-order"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20"
                >
                  주문제작 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                */}
                <Link
                  href="/category/40"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent border border-[#1d1d1f]/15 text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#f5f5f7] transition-all"
                >
                  상품 둘러보기
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex items-center gap-8 mt-10 pt-8 border-t border-black/5"
              >
                <div>
                  <div className="text-[28px] font-bold font-numeric text-[#1d1d1f]">2,000+</div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">누적 거래 업무건수</div>
                </div>
                <div className="w-px h-10 bg-black/10" />
                <div>
                  <div className="text-[28px] font-bold font-numeric text-[#1d1d1f]">98%</div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">고객 만족도</div>
                </div>
                <div className="w-px h-10 bg-black/10" />
                <div>
                  <div className="text-[28px] font-bold font-numeric text-[#1d1d1f]">7년+</div>
                  <div className="text-[12px] text-[#86868b] mt-0.5">전문 경력</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" as const }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <img
                  src={HERO_IMG}
                  alt="보건소플러스 프리미엄 인쇄물"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-spacing bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-3">
              상품 카테고리
            </h2>
            <p className="text-[17px] text-[#86868b] max-w-md mx-auto">
              보건소에 필요한 모든 인쇄물을 한 곳에서
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {categoryCards.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link href={`/category/${cat.id}`}>
                  <div
                    className="apple-card group rounded-2xl overflow-hidden"
                    style={{ backgroundColor: cat.color }}
                  >
                    <div className="p-5 pb-0">
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-[12px] text-[#86868b]">{cat.description}</p>
                    </div>
                    <div className="px-5 pt-4 pb-5">
                      <div className="rounded-xl overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full aspect-[3/2] object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-spacing bg-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-3">
              대표 상품
            </h2>
            <p className="text-[17px] text-[#86868b] max-w-md mx-auto">
              보건소플러스를 대표하는 상품들을 지금 만나보세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="apple-card bg-white rounded-2xl p-6 relative"
              >
                <span
                  className={`absolute top-4 right-4 px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                    product.tag === "BEST"
                      ? "bg-[#00A39B]/10 text-[#00A39B]"
                      : product.tag === "NEW"
                      ? "bg-emerald-50 text-emerald-600"
                      : product.tag === "인기"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {product.tag}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-5">
                  <Printer className="w-6 h-6 text-[#424245]" />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1.5">
                  {product.name}
                </h3>
                <p className="text-[13px] text-[#86868b] mb-4 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-bold font-numeric text-[#00A39B]">
                    {product.price}
                  </span>
                  <Link
                    href="/custom-order"
                    className="text-[13px] font-medium text-[#00A39B] hover:underline flex items-center gap-1"
                  >
                    주문하기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Process Section */}
      <section className="section-spacing bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/8">
                <img
                  src={PRINTING_IMG}
                  alt="프리미엄 인쇄 품질"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[12px] font-semibold text-[#00A39B] tracking-widest uppercase mb-4 block">
                Premium Quality
              </span>
              <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-5">
                한 장의 인쇄물에
                <br />
                담긴 전문성
              </h2>
              <p className="text-[17px] text-[#424245] leading-relaxed mb-8">
                최신 인쇄 장비와 숙련된 전문가의 손길로 완성되는 보건소플러스의
                인쇄물은 색감, 질감, 내구성 모든 면에서 차이를 만듭니다.
              </p>

              <div className="space-y-5">
                {[
                  { icon: Palette, title: "정밀한 색상 재현", desc: "CMYK 4도 풀컬러 인쇄로 원본에 가장 가까운 색감을 구현합니다" },
                  { icon: Award, title: "프리미엄 용지", desc: "보건소 인쇄물에 최적화된 고급 용지를 엄선하여 사용합니다" },
                  { icon: Shield, title: "품질 보증", desc: "모든 인쇄물에 대해 100% 품질 만족을 보증합니다" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00A39B]/8 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#00A39B]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-[#86868b] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="section-spacing bg-[#1d1d1f]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-white mb-3">
              왜 보건소플러스인가요?
            </h2>
            <p className="text-[17px] text-white/50 max-w-md mx-auto">
              전국 보건소가 신뢰하는 이유
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: "전국 무료배송",
                desc: "전국 어디든 빠르고 안전하게 배송해 드립니다",
              },
              {
                icon: Clock,
                title: "빠른 제작",
                desc: "주문 후 최단 3일 이내 출고 가능합니다",
              },
              {
                icon: Shield,
                title: "안심 결제",
                desc: "관공서 후불결제 및 세금계산서 발행이 가능합니다",
              },
              {
                icon: Award,
                title: "전문 디자인",
                desc: "보건소 전문 디자이너가 맞춤 디자인을 제공합니다",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-7 h-7 text-white/80" />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Trust Section */}
      <section className="section-spacing bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <span className="text-[12px] font-semibold text-[#00A39B] tracking-widest uppercase mb-4 block">
                About Us
              </span>
              <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-5">
                보건소와 함께
                <br />
                건강한 내일을 만듭니다
              </h2>
              <p className="text-[17px] text-[#424245] leading-relaxed mb-6">
                보건소플러스는 전국 보건소와 공공기관의 인쇄물 제작을 전문으로 하는
                파트너입니다. 건강 증진 사업의 효과적인 홍보를 위해 최고 품질의
                인쇄 서비스를 제공합니다.
              </p>
              <p className="text-[17px] text-[#424245] leading-relaxed mb-8">
                명함, 홍보물, 캘린더 등 보건소에 필요한 모든 인쇄물을 한 곳에서
                편리하게 주문하실 수 있습니다.
              </p>
              {/* 맞춤 주문 신청 링크 - 일시 삭제 (보관 중)
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#00A39B] hover:underline"
              >
                주문제작 문의하기
                <ArrowRight className="w-4 h-4" />
              </Link>
              */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/8">
                <img
                  src={ABOUT_IMG}
                  alt="보건소플러스 전문 서비스"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-[17px] text-[#86868b] mb-8 leading-relaxed">
              보건소플러스와 함께라면 고품질 인쇄물 제작이 쉬워집니다.
              <br />
              전화 한 통이면 전문 상담을 받으실 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* 맞춤 주문 신청 버튼 - 일시 삭제 (보관 중)
              <Link
                href="/custom-order"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20"
              >
                주문제작 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
              */}
              <a
                href="tel:15226401"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-[#1d1d1f]/15 text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-white transition-all"
              >
                <Phone className="w-4 h-4" />
                15226401
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
