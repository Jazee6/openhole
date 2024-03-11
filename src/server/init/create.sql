drop table if exists tags;

create table tags
(
    id   integer unsigned primary key not null,
    name varchar(64)                  not null
);

drop table if exists accounts;

create table accounts
(
    id         varchar(255)                               not null
        primary key,
    tid        integer unsigned                           not null,
    email      varchar(255)                               not null,
    password   varchar(255)                               not null,
    status     tinyint unsigned default 0                 not null,
    verified   boolean          default false             not null,
    created_at datetime         default current_timestamp not null,
    foreign key (tid) references tags (id)
);

create index accounts_email_index
    on accounts (email);

drop table if exists topics;

create table topics
(
    id         integer primary key autoincrement          not null,
    uid        varchar(255)                               not null,
    content    text                                       not null,
    star       int unsigned     default 0                 not null,
    status     tinyint unsigned default 0                 not null,
    created_at datetime         default current_timestamp not null,
    foreign key (uid) references accounts (id)
);

drop table if exists stars;

create table stars
(
    id         integer primary key autoincrement  not null,
    uid        varchar(255)                       not null,
    topic_id   integer unsigned                   not null,
    created_at datetime default current_timestamp not null,
    foreign key (uid) references accounts (id),
    foreign key (topic_id) references topics (id)
);

drop table if exists comments;

create table comments
(
    id         integer primary key autoincrement          not null,
    uid        varchar(255)                               not null,
    topic_id   integer unsigned                           not null,
    root_id    integer unsigned,
    to_id      integer unsigned,
    status     tinyint unsigned default 0                 not null,
    content    text                                       not null,
    created_at datetime         default current_timestamp not null,
    foreign key (uid) references accounts (id),
    foreign key (topic_id) references topics (id)
);
