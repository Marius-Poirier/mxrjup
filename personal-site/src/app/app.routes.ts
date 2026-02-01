import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';

import { BlogListComponent } from './pages/blog-list/blog-list';
import { PostDetailComponent } from './pages/post-detail/post-detail';

import { MediaComponent } from './pages/media/media';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'blog', component: BlogListComponent },
    { path: 'media', component: MediaComponent },
    { path: 'post/:id', component: PostDetailComponent },
];
