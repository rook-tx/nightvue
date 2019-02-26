<template>
	<transition appear>
		<router-view :key="$route.fullPath"></router-view>
	</transition>
</template>
