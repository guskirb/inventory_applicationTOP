const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, maxLength: 100 },
    birth_date: { type: Date, required: true },
    death_date: { type: Date },
    country: { type: String, maxLength: 100 },
    image: { type: String },
});

ArtistSchema.virtual('name').get(function () {
    if (this.first_name && this.last_name) {
        return `${this.first_name} ${this.last_name}`
    } else {
        return this.first_name;
    }
});

ArtistSchema.virtual('lifespan').get(function () {
    if (this.birth_date && this.death_date) {
        return `Born: ${DateTime.fromJSDate(this.birth_date).toLocaleString(DateTime.DATE_MED)}, Died: ${DateTime.fromJSDate(this.death_date).toLocaleString(DateTime.DATE_MED)}`;
    } else {
        return `Born: ${DateTime.fromJSDate(this.birth_date).toLocaleString(DateTime.DATE_MED)}`;
    }
});

ArtistSchema.virtual('birth_dd_mm_yyyy').get(function () {
    return  DateTime.fromJSDate(this.birth_date).toISODate();
});

ArtistSchema.virtual('death_dd_mm_yyyy').get(function () {
    return  DateTime.fromJSDate(this.death_date).toISODate();
});

ArtistSchema.virtual('url').get(function () {
    return `/artist/${this._id}`;
});

module.exports = mongoose.model('Artist', ArtistSchema);