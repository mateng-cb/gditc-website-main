import { useState, useEffect } from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import SEOHead from "../components/SEOHead";
import { getAbout } from "../lib/strapi";
import { t } from "../lib/translations";
import { useLanguage } from "./_app";

interface AboutData {
  title: string;
  blocks: any[];
  video?: Array<{
    id?: number;
    documentId?: string;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: any;
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string;
    provider?: string;
    provider_metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }>;
  aboutDwnUrl?: {
    url: string;
    name?: string;
  };
  MembershipDownloadUrl?: {
    url: string;
    name?: string;
  };
  ConstitutionDownloadUrl?: {
    url: string;
    name?: string;
  };
}

export default function About({ aboutData }: { aboutData: AboutData }) {
  const { language } = useLanguage();

  return (
    <>
      <SEOHead
        title={t(language, "about.pageTitle")}
        description={t(language, "about.pageDescription")}
      />
      <Layout>
        {/* Banner Section */}
        {/* <div className="relative z-10 overflow-hidden pb-[60px] pt-[120px] dark:bg-dark md:pt-[130px] lg:pt-[160px]">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-stroke/0 via-stroke to-stroke/0 dark:via-dark-3"></div>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center -mx-4">
              <div className="w-full px-4">
                <div className="text-center">
                  <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                    {t(language, "about.title")}
                  </h1>
                  <p className="mb-5 text-base text-body-color dark:text-dark-6">
                    {t(language, "about.pageDescription")}
                  </p>
                  <ul className="flex items-center justify-center gap-[10px]">
                    <li>
                      <a
                        href="/"
                        className="flex items-center gap-[10px] text-base font-medium text-dark dark:text-white"
                      >
                        {t(language, "common.home")}
                      </a>
                    </li>
                    <li>
                      <span className="flex items-center gap-[10px] text-base font-medium text-body-color dark:text-dark-6">
                        <span className="text-body-color dark:text-dark-6">
                          {" "}
                          /{" "}
                        </span>
                        {t(language, "about.breadcrumb")}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Who We Are Section */}
        <section className="bg-gray-1 pb-8 dark:bg-dark-2 lg:pb-[70px]">
          <div className="container mx-auto px-4">
            <div className="wow fadeInUp" data-wow-delay=".2s">
              <div className="flex flex-wrap -mx-4">
                <div className="w-full px-4">
                  <div className="mx-auto max-w-[1200px]">
                    <h2 className="mb-8 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2] text-center">
                      {t(language, "about.whoWeAre.title")}
                    </h2>

                    <div className="mb-12">
                      <p className="mb-6 text-lg leading-relaxed text-body-color dark:text-dark-6 text-left">
                        {t(language, "about.whoWeAre.description1")}
                      </p>
                      <p className="mb-8 text-lg leading-relaxed text-body-color dark:text-dark-6 text-left">
                        {t(language, "about.whoWeAre.description2")}
                      </p>

                      <div className="flex justify-center">
                        {aboutData?.video?.[0]?.url ? (
                          <div className="w-4/5 aspect-video bg-gray-200 dark:bg-dark-3 rounded-lg flex items-center justify-center">
                            <video
                              className="w-full h-full rounded-lg object-cover"
                              controls
                              poster=""
                            >
                              <source
                                src={aboutData.video[0].url}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : (
                          // <div className="w-4/5 aspect-video bg-gray-200 dark:bg-dark-3 rounded-lg flex items-center justify-center">
                          // <div className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                          //   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          //     <path d="M8 5v14l11-7z"/>
                          //   </svg>
                          //   <span>{t(language, 'about.whoWeAre.videoText')}</span>
                          // </div>
                          // </div>
                          <></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 lg:py-[140px]">
          <div className="container mx-auto px-4">
            <div className="wow fadeInUp" data-wow-delay=".4s">
              <h2 className="mb-16 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2] text-center">
                {t(language, "about.missionVision.title")}
              </h2>

              <div className="flex flex-wrap justify-center gap-8">
                <div className="w-full max-w-lg px-4 mb-8 p-12 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(language, "about.missionVision.mission")}
                    </h3>
                  </div>
                  <p className="text-base leading-relaxed text-body-color dark:text-dark-6 text-center">
                    {t(language, "about.missionVision.missionDescription")}
                  </p>
                </div>

                <div className="w-full max-w-lg px-4 mb-8 p-12 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3">
                  <div className="mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(language, "about.missionVision.vision")}
                    </h3>
                  </div>
                  <p className="text-base leading-relaxed text-body-color dark:text-dark-6 text-center">
                    {t(language, "about.missionVision.visionDescription")}
                  </p>
                </div>
              </div>

              {/* About Download Button */}
              {aboutData?.aboutDwnUrl?.url && (
                <div className="text-center mt-8">
                  <a
                    href={aboutData.aboutDwnUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {language === "zh-Hans"
                      ? "下载详细资料"
                      : "Download More Details"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Governance Framework Section */}
        <section className="bg-gray-1 py-20 dark:bg-dark-2 lg:py-[120px]">
          <div className="container mx-auto px-4">
            <div className="wow fadeInUp" data-wow-delay=".6s">
              <h2 className="mb-8 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2] text-center">
                {t(language, "about.governance.title")}
              </h2>

              <div className="mb-12 text-center">
                <p className="mx-auto max-w-4xl text-lg leading-relaxed text-body-color dark:text-dark-6">
                  {t(language, "about.governance.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Decision-making Board */}
                <div className="p-20 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="flex items-center mb-8">
                    <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(language, "about.governance.decisionBoard.title")}
                    </h3>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.decisionBoard.composition"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.decisionBoard.compositionItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(language, "about.governance.decisionBoard.keyPowers")}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.decisionBoard.keyPowersItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Expert Committee */}
                <div className="p-20 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="flex items-center mb-8">
                    <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(language, "about.governance.expertCommittee.title")}
                    </h3>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.expertCommittee.structure"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.expertCommittee.structureItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.expertCommittee.coreFunctions"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.expertCommittee.coreFunctionsItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Technical Committees */}
                <div className="p-20 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="flex items-center mb-8">
                    <div className="w-14 h-14 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(
                        language,
                        "about.governance.technicalCommittees.title"
                      )}
                    </h3>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.technicalCommittees.operatingModel"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.technicalCommittees.operatingModelItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.technicalCommittees.activeCommittees"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.technicalCommittees.activeCommitteesItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span
                              className="text-body-color dark:text-dark-6"
                              dangerouslySetInnerHTML={{ __html: item.trim() }}
                            ></span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Secretariat */}
                <div className="p-20 bg-white dark:bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-dark-3 hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="flex items-center mb-8">
                    <div className="w-14 h-14 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-xl">4</span>
                    </div>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {t(language, "about.governance.secretariat.title")}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(language, "about.governance.secretariat.leadership")}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.secretariat.leadershipItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(language, "about.governance.secretariat.keyUnits")}
                    </h4>
                    <ul className="space-y-3">
                      {t(language, "about.governance.secretariat.keyUnitsItems")
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-4">
                      {t(
                        language,
                        "about.governance.secretariat.dailyOperations"
                      )}
                    </h4>
                    <ul className="space-y-3">
                      {t(
                        language,
                        "about.governance.secretariat.dailyOperationsItems"
                      )
                        .split("|")
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-body-color dark:text-dark-6">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              {aboutData?.MembershipDownloadUrl?.url ? (
                <div className="text-center mb-16">
                  <a
                    href={aboutData.MembershipDownloadUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {t(language, "about.governance.downloadChart")}
                  </a>
                </div>
              ) : (
                <div className="text-center mb-16">
                  <a
                    href="#"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {t(language, "about.governance.downloadChart")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Core Mandates Section */}
        <section className="py-20 lg:py-[120px]">
          <div className="container mx-auto px-4">
            <div className="wow fadeInUp" data-wow-delay=".8s">
              <h2 className="mb-8 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2] text-center">
                {t(language, "about.coreMandates.title")}
              </h2>

              <div className="mb-12 text-center">
                <div className="mx-auto max-w-4xl p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <h3 className="mb-4 text-2xl font-bold text-dark dark:text-white">
                    {t(language, "about.coreMandates.visionTitle")}
                  </h3>
                  <p className="text-lg text-body-color dark:text-dark-6 italic">
                    {t(language, "about.coreMandates.visionText")}
                  </p>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="mb-8 text-2xl font-bold text-dark dark:text-white text-center">
                  {t(language, "about.coreMandates.keyObjectives")}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white dark:bg-dark rounded-lg shadow-lg">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-6 text-center text-lg font-semibold text-dark dark:text-white border-b-2 border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.strategicPillars")}
                        </th>
                        <th className="px-6 py-6 text-center text-lg font-semibold text-dark dark:text-white border-b-2 border-gray-200 dark:border-dark-3 leading-6">
                          {t(
                            language,
                            "about.coreMandates.concreteDeliverables"
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                        <td className="px-6 py-6 text-center text-base font-medium text-dark dark:text-white border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.standardization")}
                        </td>
                        <td className="px-6 py-6 text-center text-base text-body-color dark:text-dark-6 border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(
                            language,
                            "about.coreMandates.standardizationDesc"
                          )}
                        </td>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-dark-2 hover:bg-gray-150 dark:hover:bg-dark-3 transition-colors">
                        <td className="px-6 py-6 text-center text-base font-medium text-dark dark:text-white border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.qualityAssurance")}
                        </td>
                        <td className="px-6 py-6 text-center text-base text-body-color dark:text-dark-6 border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(
                            language,
                            "about.coreMandates.qualityAssuranceDesc"
                          )}
                        </td>
                      </tr>
                      <tr className="bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
                        <td className="px-6 py-6 text-center text-base font-medium text-dark dark:text-white border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.knowledgeHub")}
                        </td>
                        <td className="px-6 py-6 text-center text-base text-body-color dark:text-dark-6 border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.knowledgeHubDesc")}
                        </td>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-dark-2 hover:bg-gray-150 dark:hover:bg-dark-3 transition-colors">
                        <td className="px-6 py-6 text-center text-base font-medium text-dark dark:text-white border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(language, "about.coreMandates.ecosystemBuilding")}
                        </td>
                        <td className="px-6 py-6 text-center text-base text-body-color dark:text-dark-6 border-b border-gray-200 dark:border-dark-3 leading-6">
                          {t(
                            language,
                            "about.coreMandates.ecosystemBuildingDesc"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Core Mandates Download Button */}
              {aboutData?.ConstitutionDownloadUrl?.url && (
                <div className="text-center mt-8">
                  <a
                    href={aboutData.ConstitutionDownloadUrl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    {language === "zh-Hans"
                      ? "下载章程文件"
                      : "Download Constitution"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="bg-gray-1 py-20 dark:bg-dark-2 lg:py-[120px]">
          <div className="container mx-auto px-4">
            <div className="wow fadeInUp" data-wow-delay="1s">
              <h2 className="mb-12 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2] text-center">
                {t(language, "about.keyFeatures.title")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="px-12 py-8 bg-white dark:bg-dark rounded-lg">
                  <div className="flex items-start mb-4">
                    <span className="text-green-600 dark:text-green-400 text-2xl mr-4">
                      ✅
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark dark:text-white mb-2 text-left">
                        {t(
                          language,
                          "about.keyFeatures.multiStakeholder.title"
                        )}
                      </h3>
                      <p className="text-base text-body-color dark:text-dark-6 text-left">
                        {t(
                          language,
                          "about.keyFeatures.multiStakeholder.description"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-12 py-8 bg-white dark:bg-dark rounded-lg">
                  <div className="flex items-start mb-4">
                    <span className="text-green-600 dark:text-green-400 text-2xl mr-4">
                      ✅
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark dark:text-white mb-2 text-left">
                        {t(
                          language,
                          "about.keyFeatures.transparentDecision.title"
                        )}
                      </h3>
                      <p className="text-base text-body-color dark:text-dark-6 text-left">
                        {t(
                          language,
                          "about.keyFeatures.transparentDecision.description"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-12 py-8 bg-white dark:bg-dark rounded-lg">
                  <div className="flex items-start mb-4">
                    <span className="text-green-600 dark:text-green-400 text-2xl mr-4">
                      ✅
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-dark dark:text-white mb-2 text-left">
                        {t(language, "about.keyFeatures.globalAlignment.title")}
                      </h3>
                      <p className="text-base text-body-color dark:text-dark-6 text-left">
                        {t(
                          language,
                          "about.keyFeatures.globalAlignment.description"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg text-body-color dark:text-dark-6 italic"></p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // 从Strapi获取About页面数据
    const aboutData = await getAbout();

    return {
      props: {
        aboutData: aboutData || {
          title: "About DITC",
          blocks: [],
        },
      },
    };
  } catch (error) {
    console.error("Error in getStaticProps for about page:", error);

    return {
      props: {
        aboutData: {
          title: "About DITC",
          blocks: [],
        },
      },
    };
  }
};
