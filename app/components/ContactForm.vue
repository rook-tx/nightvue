<template>
	<form ref="form" @submit.prevent="doSubmit()">
	  <div class="form-row" v-for="field, key in fields">
	    <label :for="`field-${key}`" v-html="field.question"></label>
	    <input :id="`field-${key}`" type="text"
	    	v-if="field.type === 'textField'"
	    	:name="key" :placeholder="field.placeholder" :required="field.required">
	    <select v-else-if="field.type === 'dropdown'"
	    	:name="key" :required="field.required">
	    	<option v-for="option in field.options" :value="option">
	    		{{ option }}
	    	</option>
	    </select>
	  </div>
	  <div class="form-row">
	    <button id="submit" name="submit" type="submit" class="btn">Send Message</button>
	  </div>
	</form>
</template>

<script>

const action = __EMAIL_URL; // eslint-disable-line no-undef
const fields = __EMAIL_FIELDS; // eslint-disable-line no-undef

import axios from 'axios';

export default {
	data() {
		return {
			errors: null,
			errorMessage: null,
			success: false,
			action,
			fields
		};
	},
	methods: {
		doSubmit() {

			this.success = false;
			this.errors = null;

			let form = this.$refs.form;
			let formData = new FormData(form);

			let request = {};
			for (let item of formData) {
				request[item[0]] = item[1];
			}

			axios.post(action, request).then((response) => {

				let data = response.data;
				if (data.status === 'ok') {
					this.success = true;
					return;
				}

				this.errorMessage = data.message;
				this.errors = data.errors;

			});
		}
	}
};

</script>

<style lang="sass">

@import '../sass/variables';

input, select, textarea, button {
	color: $w;
}

option {
	background-color: #222;
}

</style>
