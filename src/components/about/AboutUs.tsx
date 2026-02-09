'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Eye, Building2, Users, Award, TrendingUp, UtensilsCrossed, Beaker, Heart } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';

export default function AboutUs() {
  const { dict } = useLang();

  // Helper function to parse stat value for CountUp
  const parseStatValue = (value: string): { isNumber: true; number: number; suffix: string } | { isNumber: false; text: string } => {
    const match = value.match(/^(\d+)(\+)?$/);
    if (match) {
      return {
        isNumber: true,
        number: parseInt(match[1], 10),
        suffix: match[2] || '',
      };
    }
    return {
      isNumber: false,
      text: value,
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const stats = [
    {
      icon: Building2,
      label: dict.about.stats.founded,
      value: dict.about.stats.founded_value,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      label: dict.about.stats.industries,
      value: dict.about.stats.industries_value,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      label: dict.about.stats.certifications,
      value: dict.about.stats.certifications_value,
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: TrendingUp,
      label: dict.about.stats.clients,
      value: dict.about.stats.clients_value,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const getIndustryIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return UtensilsCrossed;
      case 'sparkles':
        return Sparkles;
      case 'flask':
        return Beaker;
      case 'heart':
        return Heart;
      default:
        return Building2;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-primary-950/30">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container-custom mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-800">
              <Sparkles className="w-4 h-4" />
              {dict.about.badge}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {dict.about.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {dict.about.subtitle}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-opacity`} />
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {(() => {
                      const parsed = parseStatValue(stat.value);
                      if (parsed.isNumber) {
                        return <CountUp end={parsed.number} suffix={parsed.suffix} duration={2500} />;
                      }
                      return stat.value;
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-white dark:bg-gray-950">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl p-8">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-purple-600 mb-4">
                      2018
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {dict.about.hero_title}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {dict.about.hero_title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {dict.about.hero_description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {dict.about.company_overview_description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-900 dark:to-primary-950/20">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {dict.about.company_overview_title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {dict.about.innovation_title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {dict.about.innovation_description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white dark:bg-gray-950">
        <div className="container-custom mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 border border-blue-100 dark:border-blue-900"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6">
                <Target className="w-4 h-4" />
                {dict.about.mission_badge}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {dict.about.mission_title}
              </h3>
              <div className="space-y-6">
                {dict.about.mission_items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-3xl p-8 border border-purple-100 dark:border-purple-900"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 text-sm font-semibold mb-6">
                <Eye className="w-4 h-4" />
                {dict.about.vision_badge}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {dict.about.vision_title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {dict.about.vision_description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-sm font-semibold">
                  CPKB Certified
                </div>
                <div className="px-4 py-2 rounded-full bg-purple-600 dark:bg-purple-500 text-white text-sm font-semibold">
                  SJH Certified
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-900 dark:to-primary-950/20">
        <div className="container-custom mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {dict.about.industries_title}
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {dict.about.industries_items.map((industry, index) => {
              const Icon = getIndustryIcon(industry.icon);
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 text-center"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {industry.name}
                  </h4>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
