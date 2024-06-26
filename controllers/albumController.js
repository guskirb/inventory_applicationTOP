const Album = require('../models/album');
const Artist = require('../models/artist');
const Label = require('../models/label');
const Genre = require('../models/genre');
const Format = require('../models/format');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.album_list = asyncHandler(async (req, res, next) => {
    const allAlbums = await Album.find().sort({ title: 1 }).populate('artist').exec();

    res.render('./album/album_list', {
        title: 'All Albums',
        albums: allAlbums,
    });
});

exports.album_detail = asyncHandler(async (req, res, next) => {
    let album, allFormatsByArtist;
    try {
        [album, allFormatsByArtist] = await Promise.all([
            Album.findById(req.params.id).populate('artist label genre').exec(),
            Format.find({ album: req.params.id }).sort({ stock: 1 }).exec(),
        ]);
    } catch (err) {
        res.redirect('/category/albums');
    }

    res.render('./album/album_detail', {
        album: album,
        album_formats: allFormatsByArtist,
    });
});

exports.album_create_get = asyncHandler(async (req, res, next) => {
    const [allArtists, allLabels, allGenres] = await Promise.all([
        Artist.find().sort({ first_name: 1 }).exec(),
        Label.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render('./album/album_form', {
        title: 'Add Album',
        album: undefined,
        artists: allArtists,
        labels: allLabels,
        genres: allGenres,
        errors: undefined,
    });
});

exports.album_create_post = [
    body('title', 'Title must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("artist", "Artist must be selected.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('release_date', 'Invalid release date.')
        .isISO8601()
        .toDate(),
    body('label', 'Label must be selected.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('genre', 'Genre must be selected.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const album = new Album({
            title: req.body.title,
            artist: req.body.artist,
            release_date: req.body.release_date,
            label: req.body.label,
            genre: req.body.genre,
            image: req.body.image,
        });

        if (!errors.isEmpty()) {
            const [allArtists, allLabels, allGenres] = await Promise.all([
                Artist.find().sort({ last_name: 1 }).exec(),
                Label.find().sort({ name: 1 }).exec(),
                Genre.find().sort({ name: 1 }).exec(),
            ]);

            res.render('./album/album_form', {
                title: 'Add Album',
                album: album,
                artists: allArtists,
                labels: allLabels,
                genres: allGenres,
                errors: errors.array(),
            });
        } else {
            await album.save();
            res.redirect(album.url);
        }
    }),
];

exports.album_delete_get = asyncHandler(async (req, res, next) => {
    let album, allFormatsByArtist;
    try {
        [album, allFormatsByArtist] = await Promise.all([
            Album.findById(req.params.id).exec(),
            Format.find({ album: req.params.id }).exec(),
        ]);
    } catch (err) {
        res.redirect('/category/albums');
    }
    console.log(allFormatsByArtist)
    res.render('./album/album_delete', {
        album: album,
        album_formats: allFormatsByArtist,
        error: undefined,
    });
});

exports.album_delete_post = asyncHandler(async (req, res, next) => {
    const [album, allFormatsByArtist] = await Promise.all([
        Album.findById(req.params.id).exec(),
        Format.find({ album: req.params.id }).exec(),
    ]);

    if (allFormatsByArtist.length > 0) {
        res.render('./album/album_delete', {
            album: album,
            album_formats: allFormatsByArtist,
        });
        return;
    } else if (req.body.password === process.env.password) {
        await Album.findByIdAndDelete(req.params.id);
        res.redirect('/category/albums');
    } else {
        res.render('./album/album_delete', {
            album: album,
            album_formats: allFormatsByArtist,
            error: 'Password incorrect',
        });
    }
});

exports.album_update_get = asyncHandler(async (req, res, next) => {
    let album, allArtists, allLabels, allGenres;
    try {
        [album, allArtists, allLabels, allGenres] = await Promise.all([
            Album.findById(req.params.id).exec(),
            Artist.find().sort({ first_name: 1 }).exec(),
            Label.find().sort({ name: 1 }).exec(),
            Genre.find().sort({ name: 1 }).exec(),
        ]);
    } catch (err) {
        res.redirect('/category/albums');
    }

    res.render('./album/album_form', {
        title: 'Update Album',
        album: album,
        artists: allArtists,
        labels: allLabels,
        genres: allGenres,
        errors: undefined,
    });
});

exports.album_update_post = [
    body('title', 'Title must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("artist", "Artist must be selected.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('release_date', 'Invalid release date.')
        .isISO8601()
        .toDate(),
    body('label', 'Label must be selected.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('genre', 'Genre must be selected.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const album = new Album({
            title: req.body.title,
            artist: req.body.artist,
            release_date: req.body.release_date,
            label: req.body.label,
            genre: req.body.genre,
            image: req.body.image,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            const [allArtists, allLabels, allGenres] = await Promise.all([
                Artist.find().sort({ last_name: 1 }).exec(),
                Label.find().sort({ name: 1 }).exec(),
                Genre.find().sort({ name: 1 }).exec(),
            ]);

            res.render('./album/album_form', {
                title: 'Update Album',
                album: album,
                artists: allArtists,
                labels: allLabels,
                genres: allGenres,
                errors: errors.array(),
            });
        } else {
            const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, album, {});
            res.redirect(updatedAlbum.url);
        }
    }),
];