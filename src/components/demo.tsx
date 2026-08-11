'use client';
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FeatureCard } from '@/components/ui/grid-feature-cards';
import React from 'react';

const features = [
	{
		title: 'Lightning Fast',
		icon: Zap,
		description: 'Custom-built compiler optimizations ensure your scripts execute faster than any competitor.',
	},
	{
		title: '100% Undetected',
		icon: Fingerprint,
		description: 'Ring-0 bypass techniques and active signature obfuscation keep your accounts completely safe.',
	},
	{
		title: 'Auto-Updating',
		icon: Cpu,
		description: 'Never wait for patch days. Our cloud-based execution engine adapts to game updates in real-time.',
	},
	{
		title: 'Premium Community',
		icon: Sparkles,
		description: 'Join thousands of elite scripters in our private Discord. Get 24/7 priority support.',
	},
	{
		title: 'Customization',
		icon: Pencil,
		description: 'Tailor your execution experience with complete control over the UI and backend logic.',
	},
	{
		title: 'Built for Power',
		icon: Settings2,
		description: 'Provides advanced debugging and performance tooling right out of the box.',
	},
];

export default function DemoOne() {
	return (
		<section id="features" className="py-16 md:py-32 relative z-10">
			<div className="mx-auto w-full max-w-5xl space-y-8 px-4">
				<AnimatedContainer className="mx-auto max-w-3xl text-center">
					<h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-white">
						Built for Performance
					</h2>
					<p className="text-gray-400 mt-4 text-sm tracking-wide text-balance md:text-base">
						Everything you need to dominate, wrapped in a beautiful UI.
					</p>
				</AnimatedContainer>

				<AnimatedContainer
					delay={0.4}
					className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed border-white/20 divide-white/20 sm:grid-cols-2 md:grid-cols-3"
				>
					{features.map((feature, i) => (
						<FeatureCard key={i} feature={feature} />
					))}
				</AnimatedContainer>
			</div>
		</section>
	);
}

type ViewAnimationProps = {
	delay?: number;
	className?: React.ComponentProps<typeof motion.div>['className'];
	children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
