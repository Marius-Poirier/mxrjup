import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';

import { BlogListComponent } from './pages/blog-list/blog-list';
import { PostDetailComponent } from './pages/post-detail/post-detail';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'blog', component: BlogListComponent },
    { path: 'post/:id', component: PostDetailComponent },
];
